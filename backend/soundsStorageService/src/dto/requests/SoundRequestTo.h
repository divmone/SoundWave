// SoundRequestTo.h
#pragma once

#include <string>
#include <optional>
#include <cstdint>
#include <json/json.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds::dto
{

class SoundRequestTo
{
public:
    std::optional<uint64_t> id;
    uint64_t userId;
    std::string filename;
    std::string originalName;
    std::string filePath;
    int64_t fileSize;
    std::string mimeType;
    int32_t durationSeconds;

    void validate() const
    {
        if (originalName.empty())
        {
            throw ValidationException("Original name is required");
        }
        if (fileSize <= 0)
        {
            throw ValidationException("File size must be greater than 0");
        }
        if (mimeType.empty())
        {
            throw ValidationException("MIME type is required");
        }
    }

    static SoundRequestTo fromJson(const Json::Value& json)
    {
        SoundRequestTo dto;
        if (json.isMember("id")) dto.id = json["id"].asUInt64();
        if (json.isMember("userId")) dto.userId = json["userId"].asUInt64();
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