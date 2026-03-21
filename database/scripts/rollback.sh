#!/bin/bash

ENV=${1:-dev}
COUNT=${2:-1}

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "$PROJECT_ROOT/config/database/$ENV.properties"

cd "$PROJECT_ROOT/migrations"

echo "↩️ Rolling back $COUNT change(s) for $ENV environment..."
"$PROJECT_ROOT/tools/liquibase/liquibase" \
    --url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
    --username="$DB_USER" \
    --password="$DB_PASSWORD" \
    --changeLogFile=changelog/db.changelog-master.xml \
    rollbackCount "$COUNT"