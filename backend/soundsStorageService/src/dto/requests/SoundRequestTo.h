#pragma once

#include <string>
#include <optional>
#include <jsoncpp/json/json.h>
#include <stdexcept>
#include "exceptions/ValidationException.h"

namespace soundwaveSounds::dto
{

class SoundRequestTo
{
public:
    std::optional<std::string> id;
    std::string userId;
    std::string filename;
    std::string originalName;
    std::string filePath;
    int64_t fileSize;
    std::string mimeType;
    int32_t durationSeconds;

    void validate() const
    {
        if (userId.empty())
        {
            throw ValidationException("User ID is required");
        }
        if (filename.empty())
        {
            throw ValidationException("Filename is required");
        }
        if (originalName.empty())
        {
            throw ValidationException("Original name is required");
        }
        if (filePath.empty())
        {
            throw ValidationException("File path is required");
        }
        if (fileSize <= 0)
        {
            throw ValidationException("File size must be greater than 0");
        }
        if (mimeType.empty())
        {
            throw ValidationException("MIME type is required");
        }
        if (durationSeconds <= 0)
        {
            throw ValidationException("Duration must be greater than 0");
        }
    }

    static SoundRequestTo fromJson(const Json::Value& json)
    {
        SoundRequestTo dto;
        if (json.isMember("id")) dto.id = json["id"].asString();
        if (json.isMember("userId")) dto.userId = json["userId"].asString();
        if (json.isMember("filename")) dto.filename = json["filename"].asString();
        if (json.isMember("originalName")) dto.originalName = json["originalName"].asString();
        if (json.isMember("filePath")) dto.filePath = json["filePath"].asString();
        if (json.isMember("fileSize")) dto.fileSize = json["fileSize"].asInt64();
        if (json.isMember("mimeType")) dto.mimeType = json["mimeType"].asString();
        if (json.isMember("durationSeconds")) dto.durationSeconds = json["durationSeconds"].asInt();
        dto.validate();
        return dto;
    }
};

}