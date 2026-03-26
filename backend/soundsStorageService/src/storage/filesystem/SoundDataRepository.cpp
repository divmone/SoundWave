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
    LOG_INFO << "SoundDataRepo storage path: " << std::filesystem::absolute(m_basePath).string();
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
        LOG_DEBUG << "Created new directory: " << userDir;
    }
}

bool SoundDataRepository::AddFile(const std::vector<char>& data, uint64_t fileId, uint64_t userId, const std::string& extension)
{
    std::unique_lock<std::shared_mutex> lock(m_mutex);

    try
    {
        EnsureUserDirectoryExists(userId);

        std::string fullPath = GetFullPath(fileId, userId, extension);
        LOG_INFO << "[Storage] AddFile: " << std::filesystem::absolute(fullPath).string();

        if (std::filesystem::exists(fullPath))
        {
            return false;
        }

        std::ofstream file(fullPath, std::ios::binary);
        if (!file.is_open())
        {
            LOG_INFO << __FILE__ << __LINE__<< "Failed to open file " << fullPath;
            return false;
        }

        file.write(data.data(), data.size());
        file.close();

        return true;
    }
    catch (const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return false;
    }
}

bool SoundDataRepository::GetFile(std::vector<char>& outData, uint64_t fileId, uint64_t userId, const std::string& extension)
{
    std::shared_lock<std::shared_mutex> lock(m_mutex);

    try
    {
        std::string fullPath = GetFullPath(fileId, userId, extension);
        LOG_INFO << __FILE__ << " GetFile: " << std::filesystem::absolute(fullPath).string();

        if (!std::filesystem::exists(fullPath))
        {
            LOG_INFO << __FILE__ << "GetFile: NOT FOUND";
            return false;
        }

        std::ifstream file(fullPath, std::ios::binary);
        if (!file.is_open())
        {
            LOG_INFO << __FILE__ << __LINE__ << "Failed to open file " << fullPath;
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
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
             LOG_INFO << __FILE__ << __LINE__ << " File not exists " << fullPath;
            return false;
        }

        return std::filesystem::remove(fullPath);
    }
    catch (const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return false;
    }
}

std::string SoundDataRepository::GetFilePath(uint64_t fileId, uint64_t userId, const std::string& extension) const
{
    return GetFullPath(fileId, userId, extension);
}

}