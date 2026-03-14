#!/bin/bash
set -e

# Загружаем общие переменные и функции
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts/common.sh"

echo "⚠️  WARNING: This will remove Liquibase and database components!"
echo "Please make sure you have backups if needed."
echo ""

ENV=${1:-dev}
CONFIG_FILE="$CONFIG_DIR/$ENV.properties"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Функция для запроса подтверждения
confirm_action() {
    local prompt=$1
    local default=${2:-N}
    local response
    
    if [ "$default" = "Y" ]; then
        read -p "$prompt (Y/n): " -n 1 -r response
        echo
        if [[ -z "$response" ]]; then
            return 0  # По умолчанию Yes
        fi
    else
        read -p "$prompt (y/N): " -n 1 -r response
        echo
        if [[ -z "$response" ]]; then
            return 1  # По умолчанию No
        fi
    fi
    
    if [[ $response =~ ^[Yy]$ ]]; then
        return 0  # Yes
    else
        return 1  # No
    fi
}

echo "🔍 Available actions:"
echo ""

# 1. Запрос на удаление базы данных
if confirm_action "Drop database $DB_NAME?"; then
    if [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
        echo "🗄️ Dropping database $DB_NAME..."
        
        # Завершаем все подключения к базе
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true
        
        # Удаляем базу
        if PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists "$DB_NAME"; then
            echo "✅ Database $DB_NAME dropped successfully."
        else
            echo "❌ Failed to drop database $DB_NAME."
        fi
    else
        echo "⚠️ Database configuration not found or incomplete, skipping database drop."
    fi
else
    echo "⏭️  Skipping database drop."
fi
echo ""

# 2. Запрос на удаление Liquibase tools
if confirm_action "Remove Liquibase tools directory?"; then
    if [ -d "$PROJECT_ROOT/tools" ]; then
        echo "🗑️ Removing Liquibase from $PROJECT_ROOT/tools..."
        rm -rf "$PROJECT_ROOT/tools"
        echo "✅ Liquibase tools removed."
    else
        echo "⚠️ Tools directory not found, skipping."
    fi
else
    echo "⏭️  Skipping Liquibase tools removal."
fi
echo ""

# 3. Запрос на удаление конфигурационных файлов
if confirm_action "Remove all configuration files (*.properties)?"; then
    CONFIG_FILES_REMOVED=0
    
    if [ -d "$CONFIG_DIR" ]; then
        PROPERTIES_COUNT=$(find "$CONFIG_DIR" -name "*.properties" 2>/dev/null | wc -l)
        if [ "$PROPERTIES_COUNT" -gt 0 ]; then
            rm -f "$CONFIG_DIR"/*.properties
            echo "✅ Removed $PROPERTIES_COUNT configuration file(s) from $CONFIG_DIR"
            CONFIG_FILES_REMOVED=$((CONFIG_FILES_REMOVED + 1))
        fi
    fi
    
    if [ -f "$MIGRATIONS_DIR/liquibase.properties" ]; then
        rm -f "$MIGRATIONS_DIR/liquibase.properties"
        echo "✅ Removed liquibase.properties from $MIGRATIONS_DIR"
        CONFIG_FILES_REMOVED=$((CONFIG_FILES_REMOVED + 1))
    fi
    
    if [ "$CONFIG_FILES_REMOVED" -eq 0 ]; then
        echo "⚠️ No configuration files found to remove."
    fi
else
    echo "⏭️  Skipping configuration files removal."
fi
echo ""

# 4. Запрос на удаление логов (если есть)
if [ -d "$LOG_DIR" ] && [ "$(ls -A "$LOG_DIR" 2>/dev/null)" ]; then
    if confirm_action "Remove log files?"; then
        rm -rf "$LOG_DIR"/*
        echo "✅ Log files removed."
    else
        echo "⏭️  Skipping log files removal."
    fi
    echo ""
fi

# 5. Запрос на удаление миграций (changelog файлов)
if confirm_action "Remove migration changelog files?"; then
    if [ -d "$MIGRATIONS_DIR/changelog" ]; then
        CHANGELOG_COUNT=$(find "$MIGRATIONS_DIR/changelog" -type f 2>/dev/null | wc -l)
        if [ "$CHANGELOG_COUNT" -gt 0 ]; then
            rm -rf "$MIGRATIONS_DIR/changelog"/*
            echo "✅ Removed $CHANGELOG_COUNT changelog file(s)."
        else
            echo "⚠️ No changelog files found."
        fi
    else
        echo "⚠️ Changelog directory not found."
    fi
else
    echo "⏭️  Skipping changelog files removal."
fi
echo ""

# Итоговое сообщение
echo "🎉 Uninstall process completed!"
echo ""
echo "📊 Summary:"
echo "  • Environment: $ENV"
echo "  • Database: $DB_NAME"
echo "  • Project root: $PROJECT_ROOT"
echo ""
echo "You can manually remove the entire project directory if needed:"
echo "  rm -rf $PROJECT_ROOT"