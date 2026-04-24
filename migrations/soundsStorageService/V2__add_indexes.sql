-- liquibase formatted sql

-- changeset divmone:7
CREATE INDEX IF NOT EXISTS idx_products_published_created ON products(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);
