cmake_minimum_required(VERSION 3.15)
project(SoundsStorageService)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

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