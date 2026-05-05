-- liquibase formatted sql

-- changeset divmone:1 splitStatements:false
CREATE TABLE IF NOT EXISTS customer_wallets (
    iser_id BIGSERIAL NOT NULL,
    wallet VARCHAR(32)
);

-- changeset divmone:2 splitStatements:false
CREATE TYPE STATE_TYPE AS ENUM ('pending', 'declined', 'approved');

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGSERIAL,
    state STATE_TYPE,
    amount INTEGER,
    txhash VARCHAR(52)
);
