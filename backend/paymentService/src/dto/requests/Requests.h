#pragma once

#include <string>
#include <cstdint>

namespace soundwavePayment
{

namespace dto
{

struct PaymentRequestTo
{
    int32_t userId;
    int64_t productId;
    std::string amount;
    std::string currency;
    std::string paymentMethodId;

    bool validate() const
    {
        return userId > 0 && productId > 0 && !amount.empty();
    }
};

struct ConfirmPaymentRequestTo
{
    std::string paymentIntentId;
    int32_t userId;
    int64_t productId;

    bool validate() const
    {
        return !paymentIntentId.empty();
    }
};

struct RefundRequestTo
{
    std::string reason;
};

struct SetupIntentRequestTo
{
    int32_t userId;
    std::string email;

    bool validate() const
    {
        return userId > 0 && !email.empty();
    }
};

struct AddPaymentMethodRequestTo
{
    int32_t userId;
    std::string paymentMethodId;
    std::string cardHolderName;
    bool setAsDefault = false;

    bool validate() const
    {
        return userId > 0 && !paymentMethodId.empty();
    }
};

struct PaymentMethodRequestTo
{
    int32_t userId = 0;
    std::string stripeCustomerId;
    std::string stripePaymentMethodId;
    bool isDefault = false;
    std::string cardBrand;
    std::string cardLast4;
    int32_t expMonth = 0;
    int32_t expYear = 0;
    std::string cardHolderName;
};

struct PurchaseRequestTo
{
    int32_t userId = 0;
    int64_t productId = 0;
    uint64_t paymentId = 0;
    std::string pricePaid;
    std::string productTitle;
};

}

}