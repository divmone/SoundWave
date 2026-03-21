#pragma once

#include <string>
#include <optional>
#include <json/json.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds::dto
{

class SaleRequestTo
{
public:
    std::optional<std::string> id;
    std::string productId;
    std::string buyerId;
    std::string amount;
    std::string paymentMethod;
    std::optional<std::string> status;

    void validate() const
    {
        if (productId.empty())
        {
            throw ValidationException("Product ID is required");
        }
        if (buyerId.empty())
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
        if (json.isMember("id")) dto.id = json["id"].asString();
        if (json.isMember("productId")) dto.productId = json["productId"].asString();
        if (json.isMember("buyerId")) dto.buyerId = json["buyerId"].asString();
        if (json.isMember("amount")) dto.amount = json["amount"].asString();
        if (json.isMember("paymentMethod")) dto.paymentMethod = json["paymentMethod"].asString();
        if (json.isMember("status")) dto.status = json["status"].asString();
        dto.validate();
        return dto;
    }
};

}