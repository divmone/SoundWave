#!/bin/bash
set -e

# Загружаем общие переменные и функции
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

ENV=${1:-dev}

# Загружаем конфигурацию окружения
source "$CONFIG_DIR/$ENV.properties"

export LIQUIBASE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
export LIQUIBASE_USERNAME="$DB_USER"
export LIQUIBASE_PASSWORD="$DB_PASSWORD"
export LIQUIBASE_CLASSPATH="$TOOLS_DIR/lib/postgresql-42.7.1.jar"

cd "$MIGRATIONS_DIR"

echo "$LIQUIBASE_URL"
echo "🚀 Applying migrations for $ENV environment..."

"$TOOLS_DIR/liquibase" \
    --changeLogFile=changelog/db.changelog-master.xml \
    --url="$LIQUIBASE_URL" \
    --username="$LIQUIBASE_USERNAME" \
    --password="$LIQUIBASE_PASSWORD" \
    --logLevel=info \
    update

if [ $? -eq 0 ]; then
    echo "✅ Migrations applied successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi