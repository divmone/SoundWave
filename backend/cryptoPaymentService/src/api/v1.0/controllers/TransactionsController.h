//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_TRANSACTIONSCONTROLLER_H
#define SOUNDSSTORAGESERVICE_TRANSACTIONSCONTROLLER_H

#include <memory>
#include <drogon/HttpController.h>
#include <services/TransactionsService.h>

namespace soundwaveCryptoPayment
{
    class TransactionsController : public drogon::HttpController<TransactionsController, false>
    {
    private:
        std::unique_ptr<TransactionsService> m_service;
    public:
        explicit TransactionsController(std::unique_ptr<TransactionsService> service);

        METHOD_LIST_BEGIN
            ADD_METHOD_TO(TransactionsController::CreateTransaction, "/api/transactions", drogon::Post);
            ADD_METHOD_TO(TransactionsController::GetTransaction, "/api/transactions/{transactionId}", drogon::Get);
            ADD_METHOD_TO(TransactionsController::ClaimTransaction, "/api/transactions/{transactionId}/claim", drogon::Post);
        METHOD_LIST_END

        void CreateTransaction(
            const drogon::HttpRequestPtr& req,
            std::function<void(const drogon::HttpResponsePtr&)>&& callback);

        void GetTransaction(
            const drogon::HttpRequestPtr& req,
            std::function<void(const drogon::HttpResponsePtr&)>&& callback,
            int64_t transactionId);

        void ClaimTransaction(
            const drogon::HttpRequestPtr& req,
            std::function<void(const drogon::HttpResponsePtr&)>&& callback,
            int64_t transactionId);
    };
}

#endif //SOUNDSSTORAGESERVICE_TRANSACTIONSCONTROLLER_H
