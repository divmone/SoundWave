//
// Created by dmitry on 05.05.2026.
//

#ifndef CRYPTOPAYMENTSERVICE_TRANSACTIONRESPONSETO_H
#define CRYPTOPAYMENTSERVICE_TRANSACTIONRESPONSETO_H

#include <cstdint>
#include <string>
#include <json/value.h>

namespace soundwaveCryptoPayment
{
    static constexpr const char* STATE_PENDING = "pending";
    static constexpr const char* STATE_DECLINED = "declined";
    static constexpr const char* STATE_APPROVED = "approved";

    class TransactionResponseTo
    {
    public:
        std::int64_t id = 0;
        std::int64_t productId = 0;
        std::string state = "pending";
        std::int32_t amount = 0;
        std::string txhash = "";
        std::int64_t userId = 0;
        std::string from = "";
        std::string to = "";

        Json::Value toJson()
        {
            Json::Value result;
            result["id"] = static_cast<Json::Int64>(id);
            result["productId"] = static_cast<Json::Int64>(productId);
            result["state"] = state;
            result["amount"] = amount;
            result["txhash"] = txhash;
            result["userId"] = static_cast<Json::Int64>(userId);
            result["from"] = from;
            result["to"] = to;
            return result;
        }
    };
}

#endif //CRYPTOPAYMENTSERVICE_TRANSACTIONRESPONSETO_H
