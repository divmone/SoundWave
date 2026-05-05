//
// Created by dmitry on 05.05.2026.
//

#ifndef CRYPTOPAYMENTSERVICE_CUSTOMERWALLETRESPONSETO_H
#define CRYPTOPAYMENTSERVICE_CUSTOMERWALLETRESPONSETO_H

#include <cstdint>
#include <string>
#include <json/value.h>

namespace soundwaveCryptoPayment
{
    class CustomerWalletResponseTo
    {
    public:
        std::string  wallet = "";
        std::uint64_t userId = 0;

        Json::Value toJson()
        {
            Json::Value result;
            result["userId"] = userId;
            result["wallet"] = wallet;
            return result;
        }
    };
}

#endif //CRYPTOPAYMENTSERVICE_CUSTOMERWALLETRESPONSETO_H
