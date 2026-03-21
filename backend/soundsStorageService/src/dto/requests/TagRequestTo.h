#pragma once

#include <string>
#include <optional>
#include <json/json.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds::dto
{

class TagRequestTo
{
public:
    std::optional<std::string> id;
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
        if (json.isMember("id")) dto.id = json["id"].asString();
        if (json.isMember("name")) dto.name = json["name"].asString();
        dto.validate();
        return dto;
    }
};

}