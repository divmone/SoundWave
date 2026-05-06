//
// Created by dmitry on 05.05.2026.
//

#ifndef CRYPTOPAYMENTSERVICE_CUSTOMERWALLETREQUESTTO_H
#define CRYPTOPAYMENTSERVICE_CUSTOMERWALLETREQUESTTO_H
#include <cstdint>
#include <string>
#include <json/json.h>

namespace soundwaveCryptoPayment
{
    class CustomerWalletRequestTo
    {
    public:
        std::string  wallet;
        std::uint64_t userId;

        static CustomerWalletRequestTo fromJson(const Json::Value& json)
        {
            CustomerWalletRequestTo dto;
            if (json.isMember("wallet"))
            {
                dto.wallet = json["wallet"].asString();
            }
            if (json.isMember("userId"))
            {
                dto.userId = json["userId"].asUInt64();
            }
            return dto;
        }
    };
}
#endif //CRYPTOPAYMENTSERVICE_CUSTOMERWALLETREQUESTTO_H
