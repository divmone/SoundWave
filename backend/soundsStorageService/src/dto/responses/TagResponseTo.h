#pragma once

#include <string>
#include <json/json.h>

namespace soundwaveSounds::dto
{

class TagResponseTo
{
public:
    std::string id;
    std::string name;
    std::string createdAt;

    Json::Value toJson() const
    {
        Json::Value json;
        json["id"] = id;
        json["name"] = name;
        json["createdAt"] = createdAt;
        return json;
    }
};

}