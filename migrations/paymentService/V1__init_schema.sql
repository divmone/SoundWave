
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE IF NOT EXISTS stripe_customers (
                                                id BIGSERIAL PRIMARY KEY,
                                                user_id BIGINT NOT NULL UNIQUE,
                                                stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

COMMENT ON TABLE stripe_customers IS 'Связь наших пользователей с Customer в Stripe';
COMMENT ON COLUMN stripe_customers.user_id IS 'ID пользователя из таблицы users';
COMMENT ON COLUMN stripe_customers.stripe_customer_id IS 'ID Customer в Stripe (cus_xxx)';


CREATE TABLE IF NOT EXISTS payment_methods (
                                               id BIGSERIAL PRIMARY KEY,
                                               user_id BIGINT NOT NULL,
                                               stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT false,

    card_brand VARCHAR(50),        -- visa, mastercard, amex, discover
    card_last4 VARCHAR(4),         -- последние 4 цифры
    card_exp_month INTEGER,        -- месяц истечения
    card_exp_year INTEGER,          -- год истечения
    card_holder_name VARCHAR(255),  -- имя владельца


    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stripe_customer_id) REFERENCES stripe_customers(stripe_customer_id) ON DELETE CASCADE
    );

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_customer_id ON payment_methods(stripe_customer_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);

COMMENT ON TABLE payment_methods IS 'Сохраненные способы оплаты пользователей';

CREATE TABLE IF NOT EXISTS payments (
                                        id BIGSERIAL PRIMARY KEY,
                                        user_id BIGINT NOT NULL,

                                        stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_payment_method_id VARCHAR(255),

    -- Сумма и валюта
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Статусы: pending, succeeded, failed, refunded, cancelled
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    payment_type VARCHAR(50),

    -- Детали ошибки если есть
    error_code VARCHAR(100),
    error_message TEXT,

    -- Метаданные
    metadata JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

COMMENT ON TABLE payments IS 'Все платежные транзакции';


CREATE TABLE IF NOT EXISTS purchases (
                                         id BIGSERIAL PRIMARY KEY,
                                         user_id BIGINT NOT NULL,
                                         product_id BIGINT NOT NULL,
                                         payment_id BIGINT NOT NULL,

                                         price_paid DECIMAL(10,2) NOT NULL,

    is_active BOOLEAN DEFAULT true,

    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,

    UNIQUE(user_id, product_id)
    );

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_product_id ON purchases(product_id);
CREATE INDEX idx_purchases_payment_id ON purchases(payment_id);
CREATE INDEX idx_purchases_is_active ON purchases(is_active);

COMMENT ON TABLE purchases IS 'Купленные пользователями товары';


-- payment_intents (для отслеживания создания платежей)
CREATE TABLE IF NOT EXISTS payment_intents (
                                               id BIGSERIAL PRIMARY KEY,
                                               user_id BIGINT NOT NULL,
                                               stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_client_secret VARCHAR(255) NOT NULL,
    product_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'created', -- created, confirmed, completed
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

CREATE INDEX idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_stripe_payment_intent_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

COMMENT ON TABLE payment_intents IS 'Временные платежные интенты (до подтверждения)';

-- stripe_webhook_events (защита от дублей)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);


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


CREATE OR REPLACE FUNCTION check_user_can_download_sound(
    p_user_id BIGINT,
    p_sound_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
v_has_access BOOLEAN;
BEGIN
SELECT EXISTS(
    SELECT 1
    FROM purchases p
             JOIN products pr ON pr.id = p.product_id
    WHERE p.user_id = p_user_id
      AND pr.sound_id = p_sound_id
      AND p.is_active = true
) INTO v_has_access;

RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_default_card(p_user_id BIGINT)
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

CREATE OR REPLACE VIEW user_purchase_history AS
SELECT
    p.id AS purchase_id,
    p.user_id,
    u.email,
    u.username,
    pr.title AS product_title,
    pr.price AS current_price,
    p.price_paid,
    p.download_count,
    p.last_downloaded_at,
    p.created_at AS purchased_at,
    pay.status AS payment_status,
    pay.amount,
    pm.card_brand,
    pm.card_last4
FROM purchases p
         JOIN users u ON u.id = p.user_id
         JOIN products pr ON pr.id = p.product_id
         LEFT JOIN payments pay ON pay.id = p.payment_id
         LEFT JOIN payment_methods pm ON pm.stripe_payment_method_id = pay.stripe_payment_method_id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

