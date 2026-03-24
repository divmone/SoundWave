#!/bin/sh
export DB_HOST="${DB_HOST:-postgres}"
export DB_USER="${DB_USER:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-postgres}"
export DB_NAME="${DB_NAME:-soundwaveSounds}"

envsubst < config/app/config.json.template > config/app/config.json

exec ./SoundsStorageService
