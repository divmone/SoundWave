-- liquibase formatted sql

-- changeset divmone:7
ALTER table products ADD COLUMN is_ai_slop BOOLEAN DEFAULT false;