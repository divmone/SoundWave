// TagRequestTo.h
#pragma once

#include <string>
#include <optional>
#include <cstdint>
#include <json/json.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds::dto
{

class TagRequestTo
{
public:
    std::optional<uint64_t> id;
    std::string name;

    void validate() const
    {
        if (name.empty())
        {
            throw ValidationException("Tag name is required");
        }
    }

    static TagRequestTo fromJson(const Json::Value& json)
    {
        TagRequestTo dto;
        if (json.isMember("id")) dto.id = json["id"].asUInt64();
        if (json.isMember("name")) dto.name = json["name"].asString();
        dto.validate();
        return dto;
    }
};

}