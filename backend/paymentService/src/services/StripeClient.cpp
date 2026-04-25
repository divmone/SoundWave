#include "StripeClient.h"
#include <drogon/HttpClient.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <cstring>
#include <algorithm>
#include <drogon/DrClassMap.h>

namespace
{

    using namespace drogon;

std::string base64Encode(const std::string& input)
{
    static const char table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string output;
    int i = 0, j = 0;
    unsigned char charArray3[3];
    unsigned char charArray4[4];
    
    for (char c : input)
    {
        charArray3[i++] = static_cast<unsigned char>(c);
        if (i == 3)
        {
            charArray4[0] = (charArray3[0] & 0xfc) >> 2;
            charArray4[1] = ((charArray3[0] & 0x03) << 4) + ((charArray3[1] & 0xf0) >> 4);
            charArray4[2] = ((charArray3[1] & 0x0f) << 2) + ((charArray3[2] & 0xc0) >> 6);
            charArray4[3] = charArray3[2] & 0x3f;
            
            for (i = 0; i < 4; i++)
                output += table[charArray4[i]];
            i = 0;
        }
    }
    
    if (i > 0)
    {
        for (j = i; j < 3; j++)
            charArray3[j] = '\0';
        
        charArray4[0] = (charArray3[0] & 0xfc) >> 2;
        charArray4[1] = ((charArray3[0] & 0x03) << 4) + ((charArray3[1] & 0xf0) >> 4);
        charArray4[2] = ((charArray3[1] & 0x0f) << 2) + ((charArray3[2] & 0xc0) >> 6);
        
        for (j = 0; j < i + 1; j++)
            output += table[charArray4[j]];
        
        while ((3 - i) > 0)
            output += '=', i++;
    }
    
    return output;
}

std::string urlEncode(const std::string& value)
{
    static const char hexDigits[] = "0123456789ABCDEF";
    std::string result;
    
    for (char c : value)
    {
        if (std::isalnum(static_cast<unsigned char>(c)) || c == '-' || c == '_' || c == '.' || c == '~')
        {
            result += c;
        }
        else
        {
            unsigned char uc = static_cast<unsigned char>(c);
            result += '%';
            result += hexDigits[(uc >> 4) & 0x0F];
            result += hexDigits[uc & 0x0F];
        }
    }
    return result;
}

}

namespace soundwavePayment
{

StripeClient::StripeClient()
{
    auto* secretKey = std::getenv("STRIPE_SECRET_KEY");
    if (!secretKey || strlen(secretKey) == 0)
    {
        LOG_ERROR << "STRIPE_SECRET_KEY environment variable is not set";
        throw std::runtime_error("STRIPE_SECRET_KEY environment variable is not set");
    }
    m_secretKey = secretKey;
    LOG_INFO << "StripeClient initialized with secret key prefix: " << m_secretKey.substr(0, 7) << "***";
    
    m_stripeClient = drogon::HttpClient::newHttpClient(STRIPE_HOST, nullptr, false, true);
}

std::shared_ptr<StripeClient> StripeClient::create()
{
    return std::make_shared<StripeClient>();
}

std::string StripeClient::buildBasicAuth() const
{
    std::string auth = m_secretKey + ":";
    return "Basic " + base64Encode(auth);
}

Json::Value StripeClient::executePost(const std::string& path, const Json::Value& body)
{
    Json::Value result;
    
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(drogon::Post);
    req->setPath(path);
    req->addHeader("Authorization", buildBasicAuth());
    req->addHeader("Content-Type", "application/x-www-form-urlencoded");
    
    std::string formBody;
    for (const auto& key : body.getMemberNames())
    {
        if (!formBody.empty()) formBody += "&";
        formBody += key + "=" + urlEncode(body[key].asString());
    }
    req->setBody(formBody);

    {
        auto [resultCode, response] = m_stripeClient->sendRequest(req, 30.0);

        if (resultCode == ReqResult::Ok && response)
        {
            auto json = response->getJsonObject();
            if (json)
            {
                result = *json;
            }
        }

        return result;
    }

    req->setBody(formBody);
    
    auto [resultCode, response] = m_stripeClient->sendRequest(req, 30.0);
    
    if (resultCode == ReqResult::Ok && response)
    {
        Json::Reader reader;
        reader.parse(std::string(response->body()), result);
    }
    
    return result;
}

StripeClient::PaymentIntentResult StripeClient::CreatePaymentIntent(int64_t amount, const std::string& currency, int32_t userId, int64_t productId)
{
    PaymentIntentResult result;
    
    Json::Value body;
    body["amount"] = std::to_string(amount * 100);
    body["currency"] = currency;
    body["automatic_payment_methods[enabled]"] = "true";
    body["metadata[user_id]"] = std::to_string(userId);
    body["metadata[product_id]"] = std::to_string(productId);
    
    auto response = executePost("/v1/payment_intents", body);
    
    if (response.isMember("id"))
    {
        result.id = response["id"].asString();
        result.clientSecret = response["client_secret"].asString();
        result.status = response["status"].asString();
        result.success = true;
    }
    else if (response.isMember("error"))
    {
        result.errorMessage = response["error"]["message"].asString();
        result.success = false;
    }
    
    return result;
}

StripeClient::PaymentIntentResult StripeClient::ConfirmPaymentIntent(const std::string& paymentIntentId)
{
    PaymentIntentResult result;
    result.id = paymentIntentId;
    
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(drogon::Post);
    req->setPath("/v1/payment_intents/" + paymentIntentId + "/confirm");
    req->addHeader("Authorization", buildBasicAuth());
    req->addHeader("Content-Type", "application/x-www-form-urlencoded");
    req->setBody("");
    
    auto [resultCode, response] = m_stripeClient->sendRequest(req, 30.0);
    
    if (resultCode == ReqResult::Ok && response)
    {
        auto json = response->getJsonObject();
        if (json && json->isMember("error"))
        {
            result.errorMessage = (*json)["error"]["message"].asString();
            result.success = false;
        }
        else if (json)
        {
            result.status = (*json)["status"].asString();
            result.clientSecret = (*json)["client_secret"].asString();
            result.success = (result.status == "succeeded" || result.status == "processing");
        }
    }
    
    return result;
}

StripeClient::RefundResult StripeClient::CreateRefund(const std::string& paymentIntentId, const std::string& reason)
{
    RefundResult result;
    
    Json::Value body;
    body["payment_intent"] = paymentIntentId;
    if (!reason.empty())
    {
        body["reason"] = "requested_by_customer";
    }
    
    auto response = executePost("/v1/refunds", body);
    
    if (response.isMember("id"))
    {
        result.id = response["id"].asString();
        result.status = response["status"].asString();
        result.success = (result.status == "succeeded");
    }
    
return result;
}

StripeClient::CheckoutSessionResult StripeClient::CreateCheckoutSession(int64_t productId, const std::string& productTitle, int64_t amount, const std::string& currency, int32_t userId)
{
    CheckoutSessionResult result;
    
    std::string baseUrl = "https://soundwave.divmone.ru";
    
    Json::Value body;
    body["mode"] = "payment";
    body["success_url"] = baseUrl + "/?payment=success&session_id={CHECKOUT_SESSION_ID}";
    body["cancel_url"] = baseUrl + "/?payment=cancelled";
    body["line_items[0][price_data][currency]"] = currency;
    body["line_items[0][price_data][unit_amount]"] = std::to_string(amount * 100);
    body["line_items[0][price_data][product_data][name]"] = productTitle;
    body["line_items[0][quantity]"] = "1";
    body["metadata[user_id]"] = std::to_string(userId);
    body["metadata[product_id]"] = std::to_string(productId);
    body["metadata[product_title]"] = productTitle;
    
    auto response = executePost("/v1/checkout/sessions", body);
    
    if (response.isMember("id"))
    {
        result.id = response["id"].asString();
        result.url = response["url"].asString();
        result.success = true;
    }
    else if (response.isMember("error"))
    {
        result.errorMessage = response["error"]["message"].asString();
        result.success = false;
    }
    
    return result;
}

Json::Value StripeClient::ParseWebhookPayload(const std::string& payload)
{
    Json::Value json;
    Json::Reader reader;
    if (reader.parse(payload, json))
    {
        return json;
    }
    return Json::Value();
}

}