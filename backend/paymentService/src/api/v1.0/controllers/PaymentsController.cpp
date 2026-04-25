#include "PaymentsController.h"
#include <mapping/PaymentMapper.h>
#include <exceptions/ValidationException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/DatabaseException.h>

namespace soundwavePayment
{

PaymentsController::PaymentsController(std::shared_ptr<PaymentService> paymentService)
    : m_paymentService(paymentService)
{
}

void PaymentsController::CreatePayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto json = req->getJsonObject();
        if (!json)
        {
            throw ValidationException("Invalid JSON body");
        }

        int32_t userId = (*json)["userId"].asInt();
        int64_t productId = (*json)["productId"].asInt64();
        std::string amount = (*json)["amount"].asString();
        std::string currency = (*json)["currency"].asString();

        auto result = m_paymentService->CreatePayment(userId, productId, amount, currency);
        responseJson = result.toJson();
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const std::exception& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    callback(httpResponse);
}

void PaymentsController::ConfirmPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto json = req->getJsonObject();
        if (!json || !json->isMember("paymentIntentId"))
        {
            throw ValidationException("paymentIntentId is required");
        }

        std::string paymentIntentId = (*json)["paymentIntentId"].asString();
        auto result = m_paymentService->ConfirmPayment(paymentIntentId);
        responseJson = result.toJson();
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const std::exception& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    callback(httpResponse);
}

void PaymentsController::GetPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto payment = m_paymentService->GetPayment(id);
        httpResponse->setBody(Json::FastWriter().write(payment.toJson()));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const std::exception& e)
    {
        Json::Value errorJson;
        errorJson["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }

    callback(httpResponse);
}

void PaymentsController::GetUserPayments(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto payments = m_paymentService->GetUserPayments(std::stoi(userId));
        Json::Value jsonResponse(Json::arrayValue);

        for (const auto& payment : payments)
        {
            jsonResponse.append(payment.toJson());
        }

        httpResponse->setBody(Json::FastWriter().write(jsonResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const std::exception& e)
    {
        Json::Value errorJson;
        errorJson["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }

    callback(httpResponse);
}

void PaymentsController::CancelPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        bool success = m_paymentService->CancelPayment(id);
        if (success)
        {
            responseJson["message"] = "Payment cancelled successfully";
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
        else
        {
            throw NotFoundException("Payment not found");
        }
    }
    catch (const std::exception& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    callback(httpResponse);
}

void PaymentsController::RefundPayment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        std::string reason = "User requested refund";
        auto json = req->getJsonObject();
        if (json && json->isMember("reason"))
        {
            reason = (*json)["reason"].asString();
        }

        bool success = m_paymentService->RefundPurchase(id, reason);
        if (success)
        {
            responseJson["message"] = "Refund processed successfully";
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
        else
        {
            throw NotFoundException("Purchase not found");
        }
    }
    catch (const std::exception& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    callback(httpResponse);
}

void PaymentsController::CreateCheckoutSession(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        LOG_INFO << "CreateCheckoutSession request received";
        
        auto json = req->getJsonObject();
        if (!json)
        {
            LOG_ERROR << "Invalid JSON body in CreateCheckoutSession";
            throw ValidationException("Invalid JSON body");
        }

        int32_t userId = (*json)["userId"].asInt();
        int64_t productId = (*json)["productId"].asInt64();
        std::string amount = (*json)["amount"].asString();
        std::string currency = (*json)["currency"].asString();
        std::string productTitle = (*json)["productTitle"].asString();
        
        LOG_INFO << "Checkout params: userId=" << userId << " productId=" << productId << " amount=" << amount << " currency=" << currency;

        auto result = m_paymentService->CreateCheckoutSession(userId, productId, amount, currency, productTitle);
        LOG_INFO << "Checkout session created: sessionId=" << result.sessionId << " hasUrl=" << !result.checkoutUrl.empty();
        
        responseJson = result.toJson();
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const std::exception& e)
    {
        LOG_ERROR << "CreateCheckoutSession error: " << e.what();
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    callback(httpResponse);
}

}