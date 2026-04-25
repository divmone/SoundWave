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
        LOG_INFO << "Webhook received from Stripe";
        std::string payloadStr(req->getBody().data(), req->getBody().size());
        auto signature = req->getHeader("Stripe-Signature").c_str();
        LOG_INFO << "Webhook signature present: " << (strlen(signature) > 0 ? "yes" : "no");
        
        auto stripeClient = StripeClient::create();
        
        auto event = stripeClient->ParseWebhookPayload(payloadStr);
        
        if (!event.isMember("type"))
        {
            LOG_INFO << "Webhook parsed, no type field - returning OK";
            responseJson["status"] = "received";
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            callback(httpResponse);
            return;
        }
        
        std::string eventType = event["type"].asString();
        LOG_INFO << "Webhook event type: " << eventType;
        
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
        else if (eventType == "checkout.session.completed")
        {
            auto data = event["data"]["object"];
            std::string sessionId = data["id"].asString();
            int32_t userId = std::stoi(data["metadata"]["user_id"].asString());
            int64_t productId = std::stoll(data["metadata"]["product_id"].asString());
            std::string productTitle = data["metadata"]["product_title"].asString();
            std::string amountTotal = data["amount_total"].asString();
            
            LOG_INFO << "Checkout session completed: sessionId=" << sessionId << " userId=" << userId << " productId=" << productId;
            
            try
            {
                auto paymentResponse = m_paymentService->CreateCheckoutPurchase(userId, productId, productTitle, amountTotal);
                responseJson["status"] = "purchase_created";
                responseJson["purchaseId"] = paymentResponse.id;
            }
            catch (const std::exception& e)
            {
                LOG_ERROR << "Failed to create purchase from checkout: " << e.what();
                responseJson["status"] = "purchase_creation_failed";
            }
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