#!/bin/bash

# Скрипт для создания базы данных и таблиц
# Использование: ./init_db.sh

set -e  # Останавливаем скрипт при любой ошибке

# Параметры подключения к PostgreSQL
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-soundwave_db}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Настройка базы данных SoundWave ===${NC}"

# Функция для выполнения SQL через psql
execute_sql() {
    local sql="$1"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME -c "$sql" 2>/dev/null
}

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Ошибка: psql не установлен. Установите PostgreSQL клиент.${NC}"
    exit 1
fi

# Проверяем подключение к PostgreSQL
echo -e "${YELLOW}Проверка подключения к PostgreSQL...${NC}"
if ! PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -c "SELECT 1" &>/dev/null; then
    echo -e "${RED}Ошибка: Не удалось подключиться к PostgreSQL. Проверьте параметры подключения.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Подключение установлено${NC}"

# Создаем базу данных если она не существует
echo -e "${YELLOW}Проверка существования базы данных $DB_NAME...${NC}"
DB_EXISTS=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠ База данных $DB_NAME уже существует${NC}"
    read -p "Удалить существующую базу и создать новую? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Удаление существующей базы данных...${NC}"
        PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME" 2>/dev/null
        echo -e "${GREEN}✓ База данных удалена${NC}"
    else
        echo -e "${YELLOW}Пропуск создания базы данных, использование существующей${NC}"
    fi
fi

# Создаем базу данных если её нет
DB_EXISTS=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DB_EXISTS" != "1" ]; then
    echo -e "${YELLOW}Создание базы данных $DB_NAME...${NC}"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $DB_NAME" 2>/dev/null
    echo -e "${GREEN}✓ База данных создана${NC}"
fi

# Создаем таблицы
echo -e "${YELLOW}Создание таблиц...${NC}"

# Таблица sounds
echo "Создание таблицы sounds..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME <<EOF
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
EOF

# Таблица products
echo "Создание таблицы products..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    sound_id BIGINT NOT NULL REFERENCES sounds(id),
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
EOF

# Таблица tags
echo "Создание таблицы tags..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

# Таблица product_tags
echo "Создание таблицы product_tags..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS product_tags (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, tag_id)
);
EOF

# Таблица sales
echo "Создание таблицы sales..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    buyer_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_id ON sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_purchased_at ON sales(purchased_at);
EOF

# Создаем триггеры для автоматического обновления updated_at
echo "Создание триггеров для обновления updated_at..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME <<EOF
-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Удаляем существующие триггеры если есть
DROP TRIGGER IF EXISTS update_sounds_updated_at ON sounds;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Создаем триггеры
CREATE TRIGGER update_sounds_updated_at
    BEFORE UPDATE ON sounds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EOF

echo -e "${GREEN}✓ Таблицы созданы${NC}"

# Проверка создания таблиц
echo -e "${YELLOW}Проверка созданных таблиц...${NC}"
TABLES=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;")

echo -e "${GREEN}Созданные таблицы:${NC}"
for table in $TABLES; do
    echo "  - $table"
done

echo -e "${GREEN}=== База данных успешно настроена ===${NC}"
echo -e "${GREEN}Имя базы данных: $DB_NAME${NC}"
echo -e "${GREEN}Пользователь: $POSTGRES_USER${NC}"