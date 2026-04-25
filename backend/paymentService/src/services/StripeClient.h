#pragma once

#include <string>
#include <memory>
#include <drogon/HttpClient.h>
#include <json/json.h>

namespace soundwavePayment
{

class StripeClient
{
public:
    static std::shared_ptr<StripeClient> create();
    
    struct PaymentIntentResult {
        std::string id;
        std::string clientSecret;
        std::string status;
        std::string errorMessage;
        bool success = false;
    };
    
    struct RefundResult {
        std::string id;
        std::string status;
        bool success = false;
    };
    
    PaymentIntentResult CreatePaymentIntent(int64_t amount, const std::string& currency, int32_t userId, int64_t productId);
    PaymentIntentResult ConfirmPaymentIntent(const std::string& paymentIntentId);
    RefundResult CreateRefund(const std::string& paymentIntentId, const std::string& reason = "");
    Json::Value ParseWebhookPayload(const std::string& payload);
    StripeClient();
private:

    
    std::string m_secretKey;
    drogon::HttpClientPtr m_stripeClient;
    
    static constexpr const char* STRIPE_HOST = "https://api.stripe.com";
    
    Json::Value executePost(const std::string& path, const Json::Value& body);
    std::string buildBasicAuth() const;
};

}