// SaleRequestTo.h
#pragma once

#include <string>
#include <optional>
#include <cstdint>
#include <json/json.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds::dto
{

class SaleRequestTo
{
public:
    std::optional<uint64_t> id;
    uint64_t productId;
    uint64_t buyerId;
    std::string amount;
    std::string paymentMethod;
    std::optional<std::string> status;

    void validate() const
    {
        if (productId == 0)
        {
            throw ValidationException("Product ID is required");
        }
        if (buyerId == 0)
        {
            throw ValidationException("Buyer ID is required");
        }
        if (amount.empty())
        {
            throw ValidationException("Amount is required");
        }
    }

    static SaleRequestTo fromJson(const Json::Value& json)
    {
        SaleRequestTo dto;
        if (json.isMember("id")) dto.id = json["id"].asUInt64();
        if (json.isMember("productId")) dto.productId = json["productId"].asUInt64();
        if (json.isMember("buyerId")) dto.buyerId = json["buyerId"].asUInt64();
        if (json.isMember("amount")) dto.amount = json["amount"].asString();
        if (json.isMember("paymentMethod")) dto.paymentMethod = json["paymentMethod"].asString();
        if (json.isMember("status")) dto.status = json["status"].asString();
        dto.validate();
        return dto;
    }
};

}