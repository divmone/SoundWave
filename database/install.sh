#!/bin/bash
set -e

# Загружаем общие переменные и функции
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts/common.sh"

echo "🔧 Installing Liquibase and setting up database..."
echo "PROJECT_ROOT: $PROJECT_ROOT"

# Создаем необходимые директории
mkdir -m 777 -p "$TOOLS_DIR/lib"
mkdir -p "$CONFIG_DIR"
mkdir -p "$MIGRATIONS_DIR/changelog"
mkdir -p "$SCRIPTS_DIR"

# Создаем dev.properties если его нет
if [ ! -f "$CONFIG_DIR/dev.properties" ]; then
    cat > "$CONFIG_DIR/dev.properties" << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soundwave
DB_USER=postgres
DB_PASSWORD=postgres
EOF
    echo "✅ Configuration file created at $CONFIG_DIR/dev.properties"
fi

# Проверяем, установлен ли уже Liquibase
LIQUIBASE_CMD="$TOOLS_DIR/liquibase"
LIQUIBASE_VERSION="v4.24.0"

if [ -f "$LIQUIBASE_CMD" ]; then
    echo "🔍 Liquibase found, nice!"
else
    echo "📥 Downloading Liquibase $LIQUIBASE_VERSION..."
    wget -q --show-progress "https://github.com/liquibase/liquibase/releases/download/v4.24.0/liquibase-4.24.0.tar.gz" -O /tmp/liquibase-4.24.0.tar.gz
    
    echo "📦 Extracting Liquibase..."
    tar -xzf /tmp/liquibase-4.24.0.tar.gz -C "$TOOLS_DIR/"
    chmod +x "$TOOLS_DIR/liquibase"
    rm -f /tmp/liquibase-4.24.0.tar.gz
fi

# Проверяем наличие JDBC драйвера
JDBC_DRIVER="$TOOLS_DIR/lib/postgresql-42.7.1.jar"
if [ ! -f "$JDBC_DRIVER" ]; then
    echo "📥 Downloading PostgreSQL JDBC driver..."
    wget -q --show-progress https://jdbc.postgresql.org/download/postgresql-42.7.1.jar -O "$JDBC_DRIVER"
else
    echo "✅ PostgreSQL JDBC driver already exists, skipping download..."
fi

# Загружаем конфигурацию БД
if [ -f "$CONFIG_DIR/dev.properties" ]; then
    source "$CONFIG_DIR/dev.properties"
else
    echo "❌ Configuration file not found: $CONFIG_DIR/dev.properties"
    exit 1
fi

# Создаем базу данных
echo "🗄️ Creating database $DB_NAME..."

# Проверяем подключение к PostgreSQL
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
    echo "⚠️ Cannot connect to PostgreSQL. Please check if PostgreSQL is running and credentials are correct."
    echo "   Host: $DB_HOST, Port: $DB_PORT, User: $DB_USER"
else
    # Проверяем, существует ли база данных
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
        echo "⚠️ Database $DB_NAME already exists, skipping creation..."
    else
        PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        echo "✅ Database $DB_NAME created successfully!"
    fi
fi

# Создаем liquibase.properties
cat > "$MIGRATIONS_DIR/liquibase.properties" << EOF
changeLogFile=changelog/db.changelog-master.xml
url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
username=${DB_USER}
password=${DB_PASSWORD}
driver=org.postgresql.Driver
classpath=${JDBC_DRIVER}
logLevel=info
EOF

echo "✅ Liquibase properties created!"


# Проверяем подключение к базе данных
echo "🔍 Testing database connection..."
echo ""
echo "📋 Connection settings:"
echo "   • Database: $DB_NAME"
echo "   • Host: $DB_HOST"
echo "   • Port: $DB_PORT"
echo "   • User: $DB_USER"
echo "   • Password: ${#DB_PASSWORD} characters"  # Показываем только длину пароля, не сам пароль
echo "   • JDBC Driver: $JDBC_DRIVER"
echo "   • Liquibase: $TOOLS_DIR/liquibase"
echo ""

# Проверяем существование JDBC драйвера
if [ ! -f "$JDBC_DRIVER" ]; then
    echo "❌ JDBC Driver not found at: $JDBC_DRIVER"
    echo "⚠️ Database connection test skipped."
else
    # Проверяем доступность PostgreSQL
    echo "🔄 Checking PostgreSQL availability..."
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
        echo "   ✅ PostgreSQL server is accessible"
        
        # Проверяем существование базы данных
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
            echo "   ✅ Database '$DB_NAME' exists"
        else
            echo "   ⚠️ Database '$DB_NAME' does not exist yet"
        fi
    else
        echo "   ❌ Cannot connect to PostgreSQL server"
        echo "   💡 Check if PostgreSQL is running: sudo systemctl status postgresql"
    fi
    
    echo ""
    echo "🔄 Testing Liquibase connection..."
    
    # Пробуем подключиться через Liquibase
    if "$TOOLS_DIR/liquibase" \
        --url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
        --username="$DB_USER" \
        --password="$DB_PASSWORD" \
        --classpath="$JDBC_DRIVER" \
        status > /tmp/liquibase_status.log 2>&1; then
        
        echo "   ✅ Database connection successful via Liquibase!"
        
        # Показываем текущий статус миграций
        echo ""
        echo "📊 Current migration status:"
        "$TOOLS_DIR/liquibase" \
            --url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
            --username="$DB_USER" \
            --password="$DB_PASSWORD" \
            --classpath="$JDBC_DRIVER" \
            status --verbose 2>/dev/null | head -n 10
        echo ""
    fi
    
    # Удаляем временный файл
    rm -f /tmp/liquibase_status.log
fi

# Автоматически запускаем миграции после установки
echo ""
echo "🔄 Automatically running migrations..."
if [ -f "$SCRIPTS_DIR/migrate.sh" ]; then
    chmod +x "$SCRIPTS_DIR/migrate.sh"
    
    # Запускаем миграцию и проверяем результат
    if "$SCRIPTS_DIR/migrate.sh" dev; then
        echo "✅ Migrations completed successfully!"
    else
        echo "⚠️ Migrations failed. Please check manually."
        exit 1
    fi
else
    echo "⚠️ migrate.sh not found in scripts directory"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Useful commands:"
echo "  ./scripts/migrate.sh dev     # Run migrations"
echo "  ./scripts/rollback.sh dev 1  # Rollback last change"
echo "  ./scripts/status.sh dev      # Check migration status"