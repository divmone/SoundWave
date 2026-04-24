-- =====================================================
-- SOUNDWAVE PAYMENT SERVICE DATABASE
-- Микросервис оплаты - полная изоляция
-- =====================================================

-- =====================================================
-- 1. ФУНКЦИЯ ДЛЯ AUTOUPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. stripe_customers (Связь с users.id из authService)
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_customers (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);

COMMENT ON TABLE stripe_customers IS 'Связь user_id из auth сервиса с Stripe Customer';

-- =====================================================
-- 3. payment_methods (сохраненные карты)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT false,

    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    card_holder_name VARCHAR(255),

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_customer_id ON payment_methods(stripe_customer_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

-- =====================================================
-- 4. payments (платежи)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_payment_method_id VARCHAR(255),

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    payment_type VARCHAR(50),

    error_code VARCHAR(100),
    error_message TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- =====================================================
-- 5. purchases (покупки)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id BIGINT NOT NULL,
    payment_id BIGINT NOT NULL,

    price_paid DECIMAL(10,2) NOT NULL,
    product_title VARCHAR(255),

    is_active BOOLEAN DEFAULT true,

    refunded_at TIMESTAMP,
    refund_reason TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_product_id ON purchases(product_id);
CREATE INDEX idx_purchases_payment_id ON purchases(payment_id);

COMMENT ON TABLE purchases IS 'Купленные товары (user_id и product_id - ссылки на другие сервисы)';

-- =====================================================
-- 6. payment_intents (временные интенты для оплаты)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_intents (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_client_secret VARCHAR(255) NOT NULL,
    product_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_stripe_payment_intent_id ON payment_intents(stripe_payment_intent_id);

-- =====================================================
-- 7. stripe_webhook_events (защита от дублей вебхуков)
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stripe_webhook_events_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- =====================================================
-- TRIGGERS для updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON stripe_customers;
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;

CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Проверка, купил ли пользователь продукт
CREATE OR REPLACE FUNCTION check_user_purchased_product(p_user_id INTEGER, p_product_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_purchased BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM purchases
        WHERE user_id = p_user_id
          AND product_id = p_product_id
          AND is_active = true
    ) INTO v_has_purchased;
    RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql;

-- Получить дефолтную карту пользователя
CREATE OR REPLACE FUNCTION get_user_default_card(p_user_id INTEGER)
RETURNS TABLE(
    payment_method_id BIGINT,
    stripe_payment_method_id VARCHAR,
    card_brand VARCHAR,
    card_last4 VARCHAR,
    exp_month INTEGER,
    exp_year INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pm.id,
        pm.stripe_payment_method_id,
        pm.card_brand,
        pm.card_last4,
        pm.card_exp_month,
        pm.card_exp_year
    FROM payment_methods pm
    WHERE pm.user_id = p_user_id
      AND pm.is_active = true
      AND pm.is_default = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Получить все покупки пользователя
CREATE OR REPLACE FUNCTION get_user_purchases(p_user_id INTEGER)
RETURNS TABLE(
    purchase_id BIGINT,
    product_id BIGINT,
    product_title VARCHAR,
    price_paid DECIMAL,
    purchased_at TIMESTAMP,
    payment_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.product_id,
        p.product_title,
        p.price_paid,
        p.created_at,
        pay.status
    FROM purchases p
    LEFT JOIN payments pay ON pay.id = p.payment_id
    WHERE p.user_id = p_user_id
      AND p.is_active = true
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================
CREATE OR REPLACE VIEW user_payments_history AS
SELECT
    p.id,
    p.user_id,
    p.amount,
    p.currency,
    p.status,
    p.payment_type,
    p.created_at,
    pm.card_brand,
    pm.card_last4
FROM payments p
LEFT JOIN payment_methods pm ON pm.stripe_payment_method_id = p.stripe_payment_method_id
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW active_purchases AS
SELECT
    user_id,
    product_id,
    price_paid,
    created_at
FROM purchases
WHERE is_active = true;