#include "WebhookController.h"
#include <services/StripeClient.h>
#include <storage/database/PaymentIntentRepository.h>
#include <storage/database/PurchaseRepository.h>
#include <storage/database/PaymentRepository.h>
#include <exceptions/DatabaseException.h>

namespace soundwavePayment
{

WebhookController::WebhookController(std::shared_ptr<PaymentService> paymentService)
    : m_paymentService(paymentService)
{
}

void WebhookController::HandleStripeWebhook(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        std::string payloadStr(req->getBody().data(), req->getBody().size());
        auto signature = req->getHeader("Stripe-Signature").c_str();
        
        auto stripeClient = StripeClient::create();
        
        if (!stripeClient->ValidateWebhookSignature(payloadStr, signature))
        {
            responseJson["error"] = "Invalid signature";
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            callback(httpResponse);
            return;
        }
        
        auto event = stripeClient->ParseWebhookPayload(payloadStr);
        
        if (!event.isMember("type"))
        {
            responseJson["status"] = "received";
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            callback(httpResponse);
            return;
        }
        
        std::string eventType = event["type"].asString();
        
        if (eventType == "payment_intent.succeeded")
        {
            auto data = event["data"]["object"];
            std::string paymentIntentId = data["id"].asString();
            std::string status = data["status"].asString();
            
            LOG_INFO << "Payment succeeded: " << paymentIntentId;
            
            auto paymentResponse = m_paymentService->ConfirmPayment(paymentIntentId);
            
            responseJson["status"] = "processed";
            responseJson["paymentIntentId"] = paymentIntentId;
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
        else if (eventType == "payment_intent.payment_failed")
        {
            auto data = event["data"]["object"];
            std::string paymentIntentId = data["id"].asString();
            std::string errorMessage = data["last_payment_error"]["message"].asString();
            
            LOG_ERROR << "Payment failed: " << paymentIntentId << " - " << errorMessage;
            
            responseJson["status"] = "payment_failed";
            responseJson["error"] = errorMessage;
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
        else
        {
            responseJson["status"] = "received";
            responseJson["event"] = eventType;
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
    }
    catch (const std::exception& e)
    {
        LOG_ERROR << "Webhook error: " << e.what();
        responseJson["error"] = e.what();
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    callback(httpResponse);
}

}