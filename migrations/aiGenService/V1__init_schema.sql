-- liquibase formatted sql

-- changeset divmone:1
CREATE TABLE IF NOT EXISTS sound_generations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     TEXT        NOT NULL UNIQUE,
    prompt      TEXT        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    sound_id    UUID        NULL,
    response   JSONB       NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- changeset divmone:2
CREATE INDEX idx_generation_tasks_task_id ON generation_tasks(task_id);

-- changeset divmone:3
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- changeset divmone:4
CREATE TRIGGER trg_generation_tasks_updated_at
BEFORE UPDATE ON generation_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();