#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE "soundwaveSounds";
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "soundwaveSounds" <<-EOSQL
    CREATE TABLE IF NOT EXISTS sounds (
        id          BIGSERIAL PRIMARY KEY,
        user_id     BIGINT NOT NULL,
        filename    VARCHAR(255) NOT NULL DEFAULT '',
        original_name VARCHAR(255),
        file_path   VARCHAR(500) NOT NULL DEFAULT '',
        file_size   BIGINT,
        mime_type   VARCHAR(100),
        duration_seconds INT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
        id   BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
        id             BIGSERIAL PRIMARY KEY,
        sound_id       BIGINT NOT NULL REFERENCES sounds(id),
        author_id      BIGINT NOT NULL,
        title          VARCHAR(255) NOT NULL,
        description    TEXT DEFAULT '',
        price          VARCHAR(20) NOT NULL,
        rating         DECIMAL(3,2) DEFAULT 0,
        download_count INT DEFAULT 0,
        is_published   BOOLEAN DEFAULT false,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_tags (
        product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        tag_id     BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS sales (
        id         BIGSERIAL PRIMARY KEY,
        product_id BIGINT NOT NULL REFERENCES products(id),
        buyer_id   BIGINT NOT NULL,
        price      VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
EOSQL
