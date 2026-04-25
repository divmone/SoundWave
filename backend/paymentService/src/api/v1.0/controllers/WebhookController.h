#pragma once

#include <memory>
#include <cstdint>
#include <drogon/HttpController.h>
#include <services/PaymentService.h>

namespace soundwavePayment
{

using namespace drogon;

class WebhookController : public drogon::HttpController<WebhookController, false>
{
public:
    explicit WebhookController(std::shared_ptr<PaymentService> paymentService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(WebhookController::HandleStripeWebhook, "api/payment/webhooks/stripe", Post);
    METHOD_LIST_END
private:
    void HandleStripeWebhook(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    std::shared_ptr<PaymentService> m_paymentService;
};

}