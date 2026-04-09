-- init.sql — Инициализация БД soundwaveSounds для Sounds Storage Service
-- Выполняется автоматически при первом старте контейнера PostgreSQL

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ============================================================================
-- Функция для автоматического обновления поля updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Таблица sounds
-- ============================================================================
CREATE TABLE IF NOT EXISTS sounds (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    filename VARCHAR(512) NOT NULL,
    original_name VARCHAR(512) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    duration_seconds INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sounds_user_id ON sounds(user_id);
CREATE INDEX IF NOT EXISTS idx_sounds_filename ON sounds(filename);

-- ============================================================================
-- Таблица products
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    sound_id BIGINT NOT NULL REFERENCES sounds(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    download_count BIGINT DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_author_id ON products(author_id);
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_sound_id ON products(sound_id);

-- ============================================================================
-- Таблица tags
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================================
-- Таблица product_tags (составной первичный ключ)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_tags (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- ============================================================================
-- Триггеры для автоматического обновления updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_sounds_updated_at ON sounds;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

CREATE TRIGGER update_sounds_updated_at
    BEFORE UPDATE ON sounds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();