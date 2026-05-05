//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_TRANSACTIONSSERVICE_H
#define SOUNDSSTORAGESERVICE_TRANSACTIONSSERVICE_H

#include <memory>
#include <variant>
#include <cstdint>
#include <string>
#include <dto/requests/TransactionRequestTo.h>
#include <dto/responses/TransactionResponseTo.h>
#include <exceptions/DatabaseError.h>
#include <storage/database/TransactionsRepository.h>
#include <drogon/HttpClient.h>

namespace soundwaveCryptoPayment
{
    class TransactionsService
    {
    public:
        explicit TransactionsService(std::unique_ptr<TransactionsRepository> repository);

        std::variant<TransactionResponseTo, DatabaseError> CreateTransaction(const TransactionRequestTo& dto);
        std::variant<TransactionResponseTo, DatabaseError> GetTransaction(int64_t id);
        std::variant<TransactionResponseTo, DatabaseError> ClaimTransaction(int64_t id, int64_t userId);

    private:
        std::unique_ptr<TransactionsRepository> m_repository;
        drogon::HttpClientPtr m_client;

        static constexpr const char* WALLET_ADDRESS = "0x000000000000000000000000000000000000dEaD";
        static constexpr const char* ETHERSCAN_API_KEY = "YourApiKeyToken";
        static constexpr const char* ETHERSCAN_BASE_URL = "https://api-sepolia.etherscan.io/api";
        static constexpr const int SEPOLIA_CHAIN_ID = 11155111;

        bool VerifyTransactionOnBlockchain(const std::string& txhash, const std::string& from, int32_t amount);
        std::variant<TransactionResponseTo, DatabaseError> CheckAndUpdateTransactionStatus(int64_t id);
    };
}

#endif //SOUNDSSTORAGESERVICE_TRANSACTIONSSERVICE_H
