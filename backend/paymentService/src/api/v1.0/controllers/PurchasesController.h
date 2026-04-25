#pragma once

#include <memory>
#include <cstdint>
#include <drogon/HttpController.h>
#include <services/PaymentService.h>

namespace soundwavePayment
{

using namespace drogon;

class PurchasesController : public drogon::HttpController<PurchasesController, false>
{
private:
    std::shared_ptr<PaymentService> m_paymentService = nullptr;
public:
    explicit PurchasesController(std::shared_ptr<PaymentService> paymentService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(PurchasesController::GetUserPurchases, "api/payment/purchases/user/{userId}", Get, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PurchasesController::GetPurchase, "api/payment/purchases/{id}", Get, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PurchasesController::CheckAccess, "api/payment/purchases/access/{userId}/{productId}", Get, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PurchasesController::RevokeAccess, "api/payment/purchases/{id}/revoke", Post, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PurchasesController::GetDownloadUrl, "api/payment/download/{userId}/{productId}", Get, "soundwavePayment::AuthCheckMiddleware");
    METHOD_LIST_END
private:
    void GetUserPurchases(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId);
    void GetPurchase(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
    void CheckAccess(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId, const std::string& productId);
    void RevokeAccess(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
};

}