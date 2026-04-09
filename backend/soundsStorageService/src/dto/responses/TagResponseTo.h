// TagResponseTo.h
#pragma once

#include <string>
#include <cstdint>
#include <json/json.h>

namespace soundwaveSounds::dto
{

class TagResponseTo
{
public:
    uint64_t id;
    std::string name;

    Json::Value toJson() const
    {
        Json::Value json;
        json["id"] = id;
        json["name"] = name;
        return json;
    }
};

}