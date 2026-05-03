// SoundDataRepository.h
#pragma once

#include <string>
#include <vector>
#include <shared_mutex>
#include <mutex>
#include <cstdint>
#include <filesystem>
#include <drogon/HttpAppFramework.h>

namespace soundwaveSounds
{

class SoundDataRepository
{
public:
    explicit SoundDataRepository(const std::string& basePath = "./storage/sounds");
    ~SoundDataRepository() = default;

    bool AddFile(const std::vector<char>& data, uint64_t fileId, uint64_t userId, const std::string& extension);
    bool GetFile(std::vector<char>& outData, uint64_t fileId, uint64_t userId, const std::string& extension);
    bool GetFileChunk(std::vector<char>& outData, uint64_t fileId, uint64_t userId, const std::string& extension, size_t byteCount);
    std::function<size_t(char*, size_t)> GetFilePreviewStreamCallback(uint64_t fileId, uint64_t userId, const std::string& extension, size_t byteLimit);
    bool RemoveFile(uint64_t fileId, uint64_t userId, const std::string& extension);
    bool FileExists(uint64_t fileId, uint64_t userId, const std::string& extension);
    size_t GetFileSize(uint64_t fileId, uint64_t userId, const std::string& extension);
    std::string GetFilePath(uint64_t fileId, uint64_t userId, const std::string& extension) const;

private:
    std::string GetUserDirectory(uint64_t userId) const;
    std::string GetFullPath(uint64_t fileId, uint64_t userId, const std::string& extension) const;
    void EnsureUserDirectoryExists(uint64_t userId);

    std::string m_basePath;
    mutable std::shared_mutex m_mutex;
};

}