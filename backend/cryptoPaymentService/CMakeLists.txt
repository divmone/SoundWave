cmake_minimum_required(VERSION 3.15)
project(CryptoPaymentService)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -Wall -Wextra -DDEBUG")
    set(CMAKE_C_FLAGS_DEBUG "-g -O0 -Wall -Wextra -DDEBUG")

    # Для Docker отладки: подменяем пути в debug символах
    if(DEFINED ENV{DEBUG_PREFIX_MAP})
        set(DEBUG_PREFIX_MAP_FLAG "-fdebug-prefix-map=$ENV{DEBUG_PREFIX_MAP}")
        set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} ${DEBUG_PREFIX_MAP_FLAG}")
        set(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} ${DEBUG_PREFIX_MAP_FLAG}")
    endif()

    message(STATUS "Configuring in DEBUG mode with debug symbols and -O0")
else()
    set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG -flto")
    set(CMAKE_C_FLAGS_RELEASE "-O3 -DNDEBUG -flto")
    message(STATUS "Configuring in RELEASE mode with -O3 optimization")
endif()

file(GLOB_RECURSE SOURCE_FILES
        "src/*.cpp"
        "src/*.cc"
)

find_package(Drogon REQUIRED)
find_package(Jsoncpp REQUIRED)

add_executable(${PROJECT_NAME}
        ${SOURCE_FILES}
)

target_include_directories(${PROJECT_NAME} PRIVATE
        "${CMAKE_CURRENT_SOURCE_DIR}/src"
        "${JSONCPP_INCLUDE_DIRS}"
        "${DROGON_INCLUDE_DIRS}"
)

target_link_libraries(${PROJECT_NAME} Drogon::Drogon)

# Копирование папки config в директорию сборки
add_custom_command(
        TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E make_directory
        $<TARGET_FILE_DIR:${PROJECT_NAME}>/config
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_CURRENT_SOURCE_DIR}/config
        $<TARGET_FILE_DIR:${PROJECT_NAME}>/config
        COMMENT "Copying config directory to output directory"
)

# Создание папки storage в директории исполняемого файла
add_custom_command(
        TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E make_directory
        $<TARGET_FILE_DIR:${PROJECT_NAME}>/storage
        COMMENT "Creating storage directory in output directory"
)

message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Executable directory: $<TARGET_FILE_DIR:${PROJECT_NAME}>")