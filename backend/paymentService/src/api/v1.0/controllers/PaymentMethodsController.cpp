#include "PaymentMethodsController.h"
#include <mapping/PaymentMethodMapper.h>
#include <exceptions/ValidationException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/DatabaseException.h>

namespace soundwavePayment
{

PaymentMethodsController::PaymentMethodsController(std::shared_ptr<PaymentMethodService> paymentMethodService)
    : m_paymentMethodService(paymentMethodService)
{
}

void PaymentMethodsController::CreatePaymentMethod(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback)
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

        PaymentMethodResponseTo request;
        request.userId = (*json)["userId"].asInt();
        request.stripeCustomerId = (*json)["stripeCustomerId"].asString();
        request.stripePaymentMethodId = (*json)["stripePaymentMethodId"].asString();
        request.isDefault = (*json)["isDefault"].asBool();
        request.cardBrand = (*json)["cardBrand"].asString();
        request.cardLast4 = (*json)["cardLast4"].asString();
        request.expMonth = (*json)["expMonth"].asInt();
        request.expYear = (*json)["expYear"].asInt();
        request.cardHolderName = (*json)["cardHolderName"].asString();

        auto result = m_paymentMethodService->CreatePaymentMethod(request);
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

void PaymentMethodsController::GetUserPaymentMethods(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto methods = m_paymentMethodService->GetUserPaymentMethods(std::stoi(userId));
        Json::Value jsonResponse(Json::arrayValue);

        for (const auto& method : methods)
        {
            jsonResponse.append(method.toJson());
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

void PaymentMethodsController::SetDefault(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto json = req->getJsonObject();
        if (!json || !json->isMember("userId"))
        {
            throw ValidationException("userId is required");
        }

        int32_t userId = std::stoi((*json)["userId"].asString());
        bool success = m_paymentMethodService->SetDefaultMethod(id, userId);

        if (success)
        {
            responseJson["message"] = "Default payment method set successfully";
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
        else
        {
            throw NotFoundException("Payment method not found");
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

void PaymentMethodsController::DeletePaymentMethod(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        bool success = m_paymentMethodService->DeleteMethod(id);

        if (success)
        {
            responseJson["message"] = "Payment method deleted successfully";
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
        else
        {
            throw NotFoundException("Payment method not found");
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

}