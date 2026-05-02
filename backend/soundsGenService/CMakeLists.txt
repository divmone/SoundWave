cmake_minimum_required(VERSION 3.12...3.31)
project(soundsGenService CXX)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")
include(DownloadUserver)

find_package(
    userver
    COMPONENTS core #
    QUIET
)
if(NOT userver_FOUND)
    # Tries TRY_DIR first, falls back to downloading userver from GitHub using CPM.
    download_userver(TRY_DIR third_party/userver)
endif()

userver_setup_environment()

# Common sources
include_directories(src)

add_library(
    ${PROJECT_NAME}_objs OBJECT
        src/handlers/GenerateHandler.cpp
        src/services/GenerateService.cpp
        src/handlers/StatusHandler.cpp
)
target_link_libraries(
    ${PROJECT_NAME}_objs
    PUBLIC userver::core #
)