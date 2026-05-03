#!/bin/bash

# copy auth
CONTAINER_ID=$(docker ps -q --filter "publish=12346")
if [ -n "$CONTAINER_ID" ]; then
    docker cp $CONTAINER_ID:/app/db_test ./backend/authService/db_test.debug
    chmod +x ./backend/authService/db_test.debug
    echo "Binary copied successfully"
else
    echo "Container with port 12346 not found"
fi

#copy soundsStorage
CONTAINER_ID=$(docker ps -q --filter "publish=12345")
if [ -n "$CONTAINER_ID" ]; then
    docker cp $CONTAINER_ID:/app/SoundsStorageService ./backend/soundsStorageService/SoundsStorageService.debug
    chmod +x ./backend/soundsStorageService/SoundsStorageService.debug
    echo "Binary copied successfully"
else
    echo "Container with port 12345 not found"
fi