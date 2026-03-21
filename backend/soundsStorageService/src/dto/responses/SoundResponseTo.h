#pragma once

#include <string>
#include <jsoncpp/json/json.h>

namespace soundwaveSounds::dto
{

class SoundResponseTo
{
public:
    std::string id;
    std::string userId;
    std::string filename;
    std::string originalName;
    std::string filePath;
    int64_t fileSize;
    std::string mimeType;
    int32_t durationSeconds;
    std::string createdAt;
    std::string updatedAt;

    Json::Value toJson() const
    {
        Json::Value json;
        json["id"] = id;
        json["userId"] = userId;
        json["filename"] = filename;
        json["originalName"] = originalName;
        json["filePath"] = filePath;
        json["fileSize"] = fileSize;
        json["mimeType"] = mimeType;
        json["durationSeconds"] = durationSeconds;
        json["createdAt"] = createdAt;
        json["updatedAt"] = updatedAt;
        return json;
    }
};

}