//
// Created by dmitry on 05.05.2026.
//

#ifndef CRYPTOPAYMENTSERVICE_TRANSACTIONREQUESTTO_H
#define CRYPTOPAYMENTSERVICE_TRANSACTIONREQUESTTO_H

#include <cstdint>
#include <string>
#include <json/json.h>

namespace soundwaveCryptoPayment
{
    class TransactionRequestTo
    {
    public:
        std::string txhash;
        std::string from;
        std::string to;
        std::string amount;
        std::int64_t productId;
        std::int64_t userId;

        static TransactionRequestTo fromJson(const Json::Value& json)
        {
            TransactionRequestTo dto;
            if (json.isMember("txhash"))
            {
                dto.txhash = json["txhash"].asString();
            }
            if (json.isMember("from"))
            {
                dto.from = json["from"].asString();
            }
            if (json.isMember("to"))
            {
                dto.to = json["to"].asString();
            }
            if (json.isMember("amount"))
            {
                dto.amount = json["amount"].asInt64();
            }
            if (json.isMember("productId"))
            {
                dto.productId = json["productId"].asInt64();
            }
            if (json.isMember("userId"))
            {
                dto.userId = json["userId"].asInt64();
            }
            return dto;
        }
    };
}

#endif //CRYPTOPAYMENTSERVICE_TRANSACTIONREQUESTTO_H
