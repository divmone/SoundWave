//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_TRANSACTIONSSERVICE_H
#define SOUNDSSTORAGESERVICE_TRANSACTIONSSERVICE_H

#include <memory>
#include <variant>
#include <vector>
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
        enum class VerificationResult
        {
            PENDING,
            APPROVED,
            DECLINED
        };

    public:
        explicit TransactionsService(std::unique_ptr<TransactionsRepository> repository);

        std::variant<TransactionResponseTo, DatabaseError> CreateTransaction(const TransactionRequestTo& dto);
        std::variant<TransactionResponseTo, DatabaseError> GetTransaction(int64_t id);
        std::variant<TransactionResponseTo, DatabaseError> ClaimTransaction(int64_t id, int64_t userId);
        std::variant<std::vector<TransactionResponseTo>, DatabaseError> GetApprovedTransactions(int64_t userId);

    private:
        std::unique_ptr<TransactionsRepository> m_repository;
        drogon::HttpClientPtr m_client;

        const char* WALLET = std::getenv("CRYPTO_WALLET");
        const char* ETHERSCAN_API_KEY = std::getenv("ETHERSCAN_API_KEY");
        static constexpr const char* ETHERSCAN_BASE_URL = "https://api.etherscan.io";
        const char* SEPOLIA_CHAIN_ID = std::getenv("SEPOLIA_CHAIN_ID");

        VerificationResult VerifyTransactionOnBlockchain(const std::string& txhash, const std::string& from, const std::string& amount);
        std::variant<TransactionResponseTo, DatabaseError> CheckAndUpdateTransactionStatus(int64_t id);
    };
}

#endif //SOUNDSSTORAGESERVICE_TRANSACTIONSSERVICE_H
