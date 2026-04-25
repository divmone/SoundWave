#pragma once

#include <memory>
#include <cstdint>
#include <drogon/HttpController.h>
#include <services/PaymentService.h>

namespace soundwavePayment
{

using namespace drogon;

class PaymentsController : public drogon::HttpController<PaymentsController, false>
{
private:
    std::shared_ptr<PaymentService> m_paymentService = nullptr;
public:
    explicit PaymentsController(std::shared_ptr<PaymentService> paymentService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(PaymentsController::CreatePayment, "api/payment/create", Post, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentsController::ConfirmPayment, "api/payment/confirm", Post, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentsController::GetPayment, "api/payment/{id}", Get, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentsController::GetUserPayments, "api/payment/user/{userId}", Get, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentsController::CancelPayment, "api/payment/{id}/cancel", Post, "soundwavePayment::AuthCheckMiddleware");
        ADD_METHOD_TO(PaymentsController::RefundPayment, "api/payment/{id}/refund", Post, "soundwavePayment::AuthCheckMiddleware");
    METHOD_LIST_END
private:
    void CreatePayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void ConfirmPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void GetPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
    void GetUserPayments(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId);
    void CancelPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
    void RefundPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id);
};

}