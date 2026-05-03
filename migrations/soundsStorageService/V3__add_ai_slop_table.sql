-- liquibase formatted sql

ALTER table products ADD COLUMN is_ai_slop BOOLEAN DEFAULT false;