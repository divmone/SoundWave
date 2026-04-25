#pragma once

#include <string>
#include <cstdint>
#include <json/json.h>

namespace soundwavePayment
{

namespace dto
{

struct PaymentResponseTo
{
    int64_t id = 0;
    int32_t userId = 0;
    int64_t productId = 0;
    std::string stripePaymentIntentId;
    std::string stripePaymentMethodId;
    std::string clientSecret;
    std::string amount;
    std::string currency;
    std::string status;
    std::string paymentType;
    std::string errorCode;
    std::string errorMessage;
    bool isActive = true;
    std::string createdAt;
    std::string updatedAt;

    Json::Value toJson() const
    {
        Json::Value json;
        if (id > 0) json["id"] = id;
        if (userId > 0) json["userId"] = userId;
        if (productId > 0) json["productId"] = productId;
        if (!stripePaymentIntentId.empty()) json["stripePaymentIntentId"] = stripePaymentIntentId;
        if (!stripePaymentMethodId.empty()) json["stripePaymentMethodId"] = stripePaymentMethodId;
        if (!clientSecret.empty()) json["clientSecret"] = clientSecret;
        if (!amount.empty()) json["amount"] = amount;
        if (!currency.empty()) json["currency"] = currency;
        if (!status.empty()) json["status"] = status;
        if (!paymentType.empty()) json["paymentType"] = paymentType;
        if (!errorCode.empty()) json["errorCode"] = errorCode;
        if (!errorMessage.empty()) json["errorMessage"] = errorMessage;
        json["isActive"] = isActive;
        if (!createdAt.empty()) json["createdAt"] = createdAt;
        if (!updatedAt.empty()) json["updatedAt"] = updatedAt;
        return json;
    }
};

struct PurchaseResponseTo
{
    int64_t id = 0;
    int32_t userId = 0;
    int64_t productId = 0;
    uint64_t paymentId = 0;
    std::string pricePaid;
    std::string productTitle;
    bool isActive = true;
    std::string refundedAt;
    std::string refundReason;
    std::string createdAt;
    std::string updatedAt;

    Json::Value toJson() const
    {
        Json::Value json;
        if (id > 0) json["id"] = id;
        if (userId > 0) json["userId"] = userId;
        if (productId > 0) json["productId"] = productId;
        if (paymentId > 0) json["paymentId"] = paymentId;
        if (!pricePaid.empty()) json["pricePaid"] = pricePaid;
        if (!productTitle.empty()) json["productTitle"] = productTitle;
        json["isActive"] = isActive;
        if (!refundedAt.empty()) json["refundedAt"] = refundedAt;
        if (!refundReason.empty()) json["refundReason"] = refundReason;
        if (!createdAt.empty()) json["createdAt"] = createdAt;
        if (!updatedAt.empty()) json["updatedAt"] = updatedAt;
        return json;
    }
};

struct PaymentMethodResponseTo
{
    int64_t id = 0;
    int32_t userId = 0;
    std::string stripeCustomerId;
    std::string stripePaymentMethodId;
    bool isDefault = false;
    std::string cardBrand;
    std::string cardLast4;
    int32_t expMonth = 0;
    int32_t expYear = 0;
    std::string cardHolderName;
    bool isActive = true;
    std::string createdAt;
    std::string updatedAt;

    Json::Value toJson() const
    {
        Json::Value json;
        if (id > 0) json["id"] = id;
        if (userId > 0) json["userId"] = userId;
        if (!stripePaymentMethodId.empty()) json["stripePaymentMethodId"] = stripePaymentMethodId;
        json["isDefault"] = isDefault;
        if (!cardBrand.empty()) json["cardBrand"] = cardBrand;
        if (!cardLast4.empty()) json["cardLast4"] = cardLast4;
        json["expMonth"] = expMonth;
        json["expYear"] = expYear;
        if (!cardHolderName.empty()) json["cardHolderName"] = cardHolderName;
        json["isActive"] = isActive;
        if (!createdAt.empty()) json["createdAt"] = createdAt;
        if (!updatedAt.empty()) json["updatedAt"] = updatedAt;
        return json;
    }
};

struct PaymentIntentResponseTo
{
    int64_t id = 0;
    int32_t userId = 0;
    int64_t productId = 0;
    std::string stripePaymentIntentId;
    std::string clientSecret;
    std::string amount;
    std::string status;
    std::string expiresAt;
    std::string createdAt;

    Json::Value toJson() const
    {
        Json::Value json;
        if (id > 0) json["id"] = id;
        if (userId > 0) json["userId"] = userId;
        if (productId > 0) json["productId"] = productId;
        if (!stripePaymentIntentId.empty()) json["stripePaymentIntentId"] = stripePaymentIntentId;
        if (!clientSecret.empty()) json["clientSecret"] = clientSecret;
        if (!amount.empty()) json["amount"] = amount;
        if (!status.empty()) json["status"] = status;
        if (!expiresAt.empty()) json["expiresAt"] = expiresAt;
        if (!createdAt.empty()) json["createdAt"] = createdAt;
        return json;
    }
};

struct CheckoutSessionResponseTo
{
    std::string sessionId;
    std::string checkoutUrl;
    std::string errorMessage;
    
    Json::Value toJson() const
    {
        Json::Value json;
        if (!sessionId.empty()) json["sessionId"] = sessionId;
        if (!checkoutUrl.empty()) json["checkoutUrl"] = checkoutUrl;
        if (!errorMessage.empty()) json["errorMessage"] = errorMessage;
        return json;
    }
};

}

}