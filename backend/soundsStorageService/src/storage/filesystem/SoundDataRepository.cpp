// SoundDataRepository.cpp
#include "SoundDataRepository.h"
#include <fstream>
#include <iostream>

namespace soundwaveSounds
{

SoundDataRepository::SoundDataRepository(const std::string& basePath)
    : m_basePath(basePath)
{
    std::filesystem::create_directories(m_basePath);
    std::cout << "[Storage] Base path: "
              << std::filesystem::absolute(m_basePath).string() << std::endl;
}

std::string SoundDataRepository::GetUserDirectory(uint64_t userId) const
{
    return m_basePath + "/user_" + std::to_string(userId);
}

std::string SoundDataRepository::GetFullPath(uint64_t fileId, uint64_t userId, const std::string& extension) const
{
    return GetUserDirectory(userId) + "/" + std::to_string(fileId) + "." + extension;
}

void SoundDataRepository::EnsureUserDirectoryExists(uint64_t userId)
{
    std::string userDir = GetUserDirectory(userId);
    if (!std::filesystem::exists(userDir))
    {
        std::filesystem::create_directories(userDir);
    }
}

bool SoundDataRepository::AddFile(const std::vector<char>& data, uint64_t fileId, uint64_t userId, const std::string& extension)
{
    std::unique_lock<std::shared_mutex> lock(m_mutex);

    try
    {
        EnsureUserDirectoryExists(userId);

        std::string fullPath = GetFullPath(fileId, userId, extension);
        std::cout << "[Storage] AddFile: " << std::filesystem::absolute(fullPath).string() << std::endl;

        if (std::filesystem::exists(fullPath))
        {
            return false;
        }

        std::ofstream file(fullPath, std::ios::binary);
        if (!file.is_open())
        {
            return false;
        }

        file.write(data.data(), data.size());
        file.close();

        return true;
    }
    catch (const std::exception& e)
    {
        return false;
    }
}

bool SoundDataRepository::GetFile(std::vector<char>& outData, uint64_t fileId, uint64_t userId, const std::string& extension)
{
    std::shared_lock<std::shared_mutex> lock(m_mutex);

    try
    {
        std::string fullPath = GetFullPath(fileId, userId, extension);
        std::cout << "[Storage] GetFile: " << std::filesystem::absolute(fullPath).string() << std::endl;

        if (!std::filesystem::exists(fullPath))
        {
            std::cout << "[Storage] GetFile: NOT FOUND" << std::endl;
            return false;
        }

        std::ifstream file(fullPath, std::ios::binary);
        if (!file.is_open())
        {
            return false;
        }

        file.seekg(0, std::ios::end);
        size_t fileSize = file.tellg();
        file.seekg(0, std::ios::beg);

        outData.resize(fileSize);
        file.read(outData.data(), fileSize);
        file.close();

        return true;
    }
    catch (const std::exception& e)
    {
        return false;
    }
}

bool SoundDataRepository::RemoveFile(uint64_t fileId, uint64_t userId, const std::string& extension)
{
    std::unique_lock<std::shared_mutex> lock(m_mutex);

    try
    {
        std::string fullPath = GetFullPath(fileId, userId, extension);

        if (!std::filesystem::exists(fullPath))
        {
            return false;
        }

        return std::filesystem::remove(fullPath);
    }
    catch (const std::exception& e)
    {
        return false;
    }
}

bool SoundDataRepository::FileExists(uint64_t fileId, uint64_t userId, const std::string& extension)
{
    std::shared_lock<std::shared_mutex> lock(m_mutex);

    try
    {
        std::string fullPath = GetFullPath(fileId, userId, extension);
        return std::filesystem::exists(fullPath);
    }
    catch (const std::exception& e)
    {
        return false;
    }
}

std::string SoundDataRepository::GetFilePath(uint64_t fileId, uint64_t userId, const std::string& extension) const
{
    return GetFullPath(fileId, userId, extension);
}

}