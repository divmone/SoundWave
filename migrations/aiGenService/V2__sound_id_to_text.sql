-- liquibase formatted sql

-- changeset divmone:5
ALTER TABLE sound_generations ALTER COLUMN sound_id TYPE text USING sound_id::text;
