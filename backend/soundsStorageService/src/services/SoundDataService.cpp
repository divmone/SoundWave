#include "services/SoundDataService.h"
#include <unordered_set>
#include <algorithm>
#include <cctype>

namespace soundwaveSounds
{

SoundDataService::SoundDataService(std::shared_ptr<SoundDataRepository> repository)
    : m_client(HttpClient::newHttpClient("http://nginx")), m_repository(repository)
{
}

bool SoundDataService::SaveSoundFile(const HttpFile& file, uint64_t fileId, uint64_t userId)
{
    if (file.fileLength() == 0)
        return false;

    std::string_view extension = file.getFileExtension();
    if (extension.empty())
        return false;

    std::string extStr(extension);
    if (!IsValidAudioExtension(extStr))
        return false;

    std::string_view fileData = file.fileContent();
    std::vector<char> data(fileData.begin(), fileData.end());

    return m_repository->AddFile(data, fileId, userId, extStr);
}

    bool SoundDataService::SaveSoundFileFromUrl(const std::string& url, uint64_t fileId, uint64_t userId)
{
    if (url.empty())
    {
        LOG_ERROR << "URL is empty";
        return false;
    }

    std::string extension = ExtractExtensionFromUrl(url);
    if (extension.empty() || !IsValidAudioExtension(extension))
    {
        LOG_ERROR << "Invalid extension from URL: " << url;
        return false;
    }

    std::string scheme, host, path;
    if (!ParseUrl(url, scheme, host, path))
    {
        LOG_ERROR << "Failed to parse URL: " << url;
        return false;
    }


    auto req = HttpRequest::newHttpRequest();
    req->setMethod(Get);
    req->setPath("/external-proxy" + path);

    auto [result, response] = m_client->sendRequest(req, 60.0);

    if (result == ReqResult::Ok && response)
    {
        int statusCode = response->getStatusCode();

        if (statusCode >= 200 && statusCode < 300)
        {
            auto bodyView = response->body();

            if (!bodyView.empty())
            {
                std::vector<char> data(bodyView.begin(), bodyView.end());
                bool saved = m_repository->AddFile(data, fileId, userId, extension);

                if (saved)
                    LOG_INFO << "Saved audio from URL, size: " << bodyView.size();
                else
                    LOG_ERROR << "Repository save failed";

                return saved;
            }

            LOG_ERROR << "Empty response body";
            return false;
        }

        LOG_ERROR << "HTTP status: " << statusCode;
        return false;
    }

    LOG_ERROR << "Request failed, result: " << static_cast<int>(result);
    return false;
}

bool SoundDataService::GetSoundFile(std::vector<char>& outData, uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
        return false;
    return m_repository->GetFile(outData, fileId, userId, std::string(extension));
}

bool SoundDataService::GetSoundPreviewChunk(std::vector<char>& outData, uint64_t fileId, uint64_t userId, std::string_view extension, int32_t durationSeconds)
{
    if (extension.empty() || durationSeconds <= 0)
        return false;

    size_t totalFileSize = m_repository->GetFileSize(fileId, userId, std::string(extension));
    if (totalFileSize == 0)
        return false;

    constexpr int32_t previewSeconds = 5;
    size_t previewBytes;

    if (durationSeconds <= previewSeconds)
        previewBytes = totalFileSize;
    else
        previewBytes = static_cast<size_t>(static_cast<double>(previewSeconds) / durationSeconds * totalFileSize);

    return m_repository->GetFileChunk(outData, fileId, userId, std::string(extension), previewBytes);
}

size_t SoundDataService::GetSoundFileSize(uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
        return 0;
    return m_repository->GetFileSize(fileId, userId, std::string(extension));
}

bool SoundDataService::DeleteSoundFile(uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
        return false;
    return m_repository->RemoveFile(fileId, userId, std::string(extension));
}

bool SoundDataService::SoundFileExists(uint64_t fileId, uint64_t userId, std::string_view extension)
{
    if (extension.empty())
        return false;
    return m_repository->FileExists(fileId, userId, std::string(extension));
}

std::string SoundDataService::GetSoundFilePath(uint64_t fileId, uint64_t userId, std::string_view extension) const
{
    return m_repository->GetFilePath(fileId, userId, std::string(extension));
}

bool SoundDataService::ParseUrl(const std::string& url, std::string& scheme, std::string& host, std::string& path) const
{
    size_t schemeEnd = url.find("://");
    if (schemeEnd == std::string::npos)
        return false;

    scheme = url.substr(0, schemeEnd);

    size_t hostStart = schemeEnd + 3;
    size_t pathStart = url.find('/', hostStart);

    if (pathStart == std::string::npos)
    {
        host = url.substr(hostStart);
        path = "/";
    }
    else
    {
        host = url.substr(hostStart, pathStart - hostStart);
        path = url.substr(pathStart);
    }

    return !host.empty();
}

std::string SoundDataService::ExtractExtensionFromUrl(const std::string& url) const
{
    std::string pathOnly;
    size_t queryPos = url.find('?');

    if (queryPos != std::string::npos)
        pathOnly = url.substr(0, queryPos);
    else
        pathOnly = url;

    size_t lastDot = pathOnly.find_last_of('.');
    size_t lastSlash = pathOnly.find_last_of('/');

    if (lastDot == std::string::npos || (lastSlash != std::string::npos && lastDot < lastSlash))
        return "";

    std::string extension = pathOnly.substr(lastDot + 1);

    extension.erase(std::remove_if(extension.begin(), extension.end(),
        [](unsigned char c) { return !std::isalnum(c); }), extension.end());

    std::transform(extension.begin(), extension.end(), extension.begin(),
        [](unsigned char c) { return std::tolower(c); });

    return extension;
}

bool SoundDataService::IsValidAudioExtension(const std::string& extension) const
{
    static const std::unordered_set<std::string> allowedExtensions =
    {
        "mp3", "wav", "ogg", "m4a", "flac", "aac"
    };

    return allowedExtensions.find(extension) != allowedExtensions.end();
}

}