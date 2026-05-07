//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_TRANSACTIONSREPOSITORY_H
#define SOUNDSSTORAGESERVICE_TRANSACTIONSREPOSITORY_H

#include <vector>
#include <dto/responses/TransactionResponseTo.h>
#include <dto/requests/TransactionRequestTo.h>
#include "IDatabaseRepository.h"
#include "models/Transactions.h"

namespace soundwaveCryptoPayment
{
    class TransactionsRepository : public IDatabaseRepository<drogon_model::soundwaveCryptoPayment::Transactions, int64_t, DatabaseError>
    {
    private:
        const std::string WALLET = std::getenv("CRYPTO_WALLET");
    public:
        std::variant<TransactionResponseTo, DatabaseError> CreateTransaction(const TransactionRequestTo& dto);
        std::variant<TransactionResponseTo, DatabaseError> GetTransactionById(int64_t id);
        std::variant<std::vector<TransactionResponseTo>, DatabaseError> GetApprovedTransactionsByUserId(int64_t userId);
        std::variant<bool, DatabaseError> UpdateTransactionState(int64_t id, const std::string& state);
    };
}

#endif //SOUNDSSTORAGESERVICE_TRANSACTIONSREPOSITORY_H
