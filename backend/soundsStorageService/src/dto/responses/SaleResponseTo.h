// SaleResponseTo.h
#pragma once

#include <string>
#include <cstdint>
#include <json/json.h>

namespace soundwaveSounds::dto
{

class SaleResponseTo
{
public:
    uint64_t id;
    uint64_t productId;
    uint64_t buyerId;
    std::string amount;
    std::string paymentMethod;
    std::string status;
    std::string purchasedAt;

    Json::Value toJson() const
    {
        Json::Value json;
        json["id"] = id;
        json["productId"] = productId;
        json["buyerId"] = buyerId;
        json["amount"] = amount;
        json["paymentMethod"] = paymentMethod;
        json["status"] = status;
        json["purchasedAt"] = purchasedAt;
        return json;
    }
};

}