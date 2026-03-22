// ProductResponseTo.h
#pragma once

#include <string>
#include <vector>
#include <cstdint>
#include <json/json.h>

namespace soundwaveSounds::dto
{

class ProductResponseTo
{
public:
    uint64_t id;
    uint64_t soundId;
    uint64_t authorId;
    std::string title;
    std::string description;
    std::string price;
    double rating;
    int64_t downloadCount;
    bool isPublished;
    std::vector<uint64_t> tagIds;
    std::vector<std::string> tagNames;
    std::string createdAt;
    std::string updatedAt;

    Json::Value toJson() const
    {
        Json::Value json;
        json["id"] = id;
        json["soundId"] = soundId;
        json["authorId"] = authorId;
        json["title"] = title;
        json["description"] = description;
        json["price"] = price;
        json["rating"] = rating;
        json["downloadCount"] = downloadCount;
        json["isPublished"] = isPublished;
        Json::Value tagsArray(Json::arrayValue);
        for (const auto& tagId : tagIds)
        {
            tagsArray.append(tagId);
        }
        json["tagIds"] = tagsArray;
        Json::Value tagNamesArray(Json::arrayValue);
        for (const auto& tagName : tagNames)
        {
            tagNamesArray.append(tagName);
        }
        json["tagNames"] = tagNamesArray;
        json["createdAt"] = createdAt;
        json["updatedAt"] = updatedAt;
        return json;
    }
};

}