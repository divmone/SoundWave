// SoundDataService.cpp
#include "services/SoundDataService.h"
#include <unordered_set>

namespace soundwaveSounds
{

SoundDataService::SoundDataService(std::shared_ptr<SoundDataRepository> repository)
    : m_repository(repository)
{
}

bool SoundDataService::SaveSoundFile(const HttpFile& file, uint64_t fileId, uint64_t userId)
{
    if (file.fileLength() == 0)
    {
        return false;
    }

    std::string_view extension = file.getFileExtension();
    if (extension.empty())
    {
        return false;
    }

    static const std::unordered_set<std::string> allowedExtensions = 
    {
        "mp3", "wav", "ogg", "m4a", "flac", "aac"
    };

    std::string extStr(extension);
    if (allowedExtensions.find(extStr) == allowedExtensions.end())
    {
        return false;
    }

    std::string_view fileData = file.fileContent();
    std::vector<char> data(fileData.begin(), fileData.end());

    return m_repository->AddFile(data, fileId, userId, extStr);
}

bool SoundDataService::GetSoundFile(std::vector<char>& outData, uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
    {
        return false;
    }

    return m_repository->GetFile(outData, fileId, userId, std::string(extension));
}

bool SoundDataService::GetSoundPreviewChunk(std::vector<char>& outData, uint64_t fileId, uint64_t userId, std::string_view extension, int32_t durationSeconds)
{
    if (extension.empty() || durationSeconds <= 0)
    {
        return false;
    }

    size_t totalFileSize = m_repository->GetFileSize(fileId, userId, std::string(extension));
    if (totalFileSize == 0)
    {
        return false;
    }

    constexpr int32_t previewSeconds = 5;
    size_t previewBytes;

    if (durationSeconds <= previewSeconds)
    {
        previewBytes = totalFileSize;
    }
    else
    {
        previewBytes = static_cast<size_t>(static_cast<double>(previewSeconds) / durationSeconds * totalFileSize);
    }

    return m_repository->GetFileChunk(outData, fileId, userId, std::string(extension), previewBytes);
}

size_t SoundDataService::GetSoundFileSize(uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
    {
        return 0;
    }

    return m_repository->GetFileSize(fileId, userId, std::string(extension));
}

bool SoundDataService::DeleteSoundFile(uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
    {
        return false;
    }

    return m_repository->RemoveFile(fileId, userId, std::string(extension));
}

bool SoundDataService::SoundFileExists(uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
    {
        return false;
    }

    return m_repository->FileExists(fileId, userId, std::string(extension));
}

std::string SoundDataService::GetSoundFilePath(uint64_t fileId, uint64_t userId, std::string_view extension) const
{
    return m_repository->GetFilePath(fileId, userId, std::string(extension));
}

}