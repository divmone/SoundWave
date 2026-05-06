// SoundDataService.h
#pragma once

#include <memory>
#include <vector>
#include <string>
#include <string_view>
#include <cstdint>
#include <drogon/drogon.h>
#include <storage/filesystem/SoundDataRepository.h>

namespace soundwaveSounds
{

using namespace drogon;

    class SoundDataService
    {
    public:
        explicit SoundDataService(std::shared_ptr<SoundDataRepository> repository);
        ~SoundDataService() = default;

        bool SaveSoundFile(const HttpFile& file, uint64_t fileId, uint64_t userId);
        bool SaveSoundFileFromUrl(const std::string& url, uint64_t fileId, uint64_t userId);
        bool GetSoundFile(std::vector<char>& outData, uint64_t fileId, uint64_t userId, std::string_view extension);
        bool GetSoundPreviewChunk(std::vector<char>& outData, uint64_t fileId, uint64_t userId, std::string_view extension, int32_t durationSeconds);
        bool DeleteSoundFile(uint64_t fileId, uint64_t userId, std::string_view extension);
        bool SoundFileExists(uint64_t fileId, uint64_t userId, std::string_view extension);
        size_t GetSoundFileSize(uint64_t fileId, uint64_t userId, std::string_view extension);
        std::string GetSoundFilePath(uint64_t fileId, uint64_t userId, std::string_view extension) const;

    private:
        HttpClientPtr m_client;
        std::shared_ptr<SoundDataRepository> m_repository;
        std::string ExtractExtensionFromUrl(const std::string& url) const;
        bool IsValidAudioExtension(const std::string& extension) const;
        bool ParseUrl(const std::string& url, std::string& scheme, std::string& host, std::string& path) const;
    };


}