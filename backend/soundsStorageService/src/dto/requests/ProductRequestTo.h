// ProductRequestTo.h
#pragma once

#include <string>
#include <optional>
#include <vector>
#include <cstdint>
#include <json/json.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds::dto
{

class ProductRequestTo
{
public:
    std::optional<uint64_t> id;
    uint64_t soundId;
    uint64_t authorId;
    std::string title;
    std::string description;
    std::string price;
    std::optional<double> rating;
    std::optional<int64_t> downloadCount;
    std::optional<bool> isPublished;
    std::vector<uint64_t> tagIds;
    bool isAiSlop = false;

    void validate() const
    {
        if (soundId == 0)
        {
            throw ValidationException("Sound ID is required");
        }
        if (authorId == 0)
        {
            throw ValidationException("Author ID is required");
        }
        if (title.empty())
        {
            throw ValidationException("Title is required");
        }
        if (price.empty())
        {
            throw ValidationException("Price is required");
        }
    }

    static ProductRequestTo fromJson(const Json::Value& json)
    {
        ProductRequestTo dto;
        if (json.isMember("id")) dto.id = json["id"].asUInt64();
        if (json.isMember("soundId")) dto.soundId = json["soundId"].asUInt64();
        if (json.isMember("authorId")) dto.authorId = json["authorId"].asUInt64();
        if (json.isMember("title")) dto.title = json["title"].asString();
        if (json.isMember("description")) dto.description = json["description"].asString();
        if (json.isMember("price")) dto.price = json["price"].asString();
        if (json.isMember("rating")) dto.rating = json["rating"].asDouble();
        if (json.isMember("downloadCount")) dto.downloadCount = json["downloadCount"].asInt64();
        if (json.isMember("isPublished")) dto.isPublished = json["isPublished"].asBool();
        if (json.isMember("tagIds"))
        {
            for (const auto& tag : json["tagIds"])
            {
                dto.tagIds.push_back(tag.asUInt64());
            }
        }
        dto.validate();
        return dto;
    }
};

}