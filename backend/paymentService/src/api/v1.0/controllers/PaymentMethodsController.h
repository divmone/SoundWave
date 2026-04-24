#pragma once

#include <memory>
#include <cstdint>
#include <drogon/HttpController.h>
#include <services/PaymentMethodService.h>

namespace soundwavePayment
{

using namespace drogon;

class PaymentMethodsController : public drogon::HttpController<PaymentMethodsController, false>
{
private:
    std::shared_ptr<PaymentMethodService> m_paymentMethodService = nullptr;
public:
    explicit PaymentMethodsController(std::shared_ptr<PaymentMethodService> paymentMethodService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(PaymentMethodsController::CreatePaymentMethod, "api/payment/methods", Post, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentMethodsController::GetUserPaymentMethods, "api/payment/methods/user/{userId}", Get, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentMethodsController::SetDefault, "api/payment/methods/{id}/default", Post, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentMethodsController::DeletePaymentMethod, "api/payment/methods/{id}", Delete, "soundwavePayment::AuthCheckMiddleware");
    METHOD_LIST_END
private:
    void CreatePaymentMethod(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void GetUserPaymentMethods(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId);
    void SetDefault(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
    void DeletePaymentMethod(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
};

}