#include "PurchasesController.h"
#include <mapping/PurchaseMapper.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/DatabaseException.h>

namespace soundwavePayment
{

PurchasesController::PurchasesController(std::shared_ptr<PaymentService> paymentService)
    : m_paymentService(paymentService)
{
}

void PurchasesController::GetUserPurchases(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto purchases = m_paymentService->GetUserPurchases(std::stoi(userId));
        Json::Value jsonResponse(Json::arrayValue);

        for (const auto& purchase : purchases)
        {
            jsonResponse.append(purchase.toJson());
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

void PurchasesController::GetPurchase(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto purchase = m_paymentService->GetPurchase(id);
        httpResponse->setBody(Json::FastWriter().write(purchase.toJson()));
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

void PurchasesController::CheckAccess(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& userId, const std::string& productId)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    bool hasAccess = m_paymentService->CheckUserHasAccess(std::stoi(userId), std::stoll(productId));
    responseJson["hasAccess"] = hasAccess;
    responseJson["userId"] = userId;
    responseJson["productId"] = productId;

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    httpResponse->setStatusCode(HttpStatusCode::k200OK);

    callback(httpResponse);
}

void PurchasesController::RevokeAccess(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        bool success = m_paymentService->RefundPurchase(id, "Access revoked by admin");
        if (success)
        {
            responseJson["message"] = "Access revoked successfully";
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

}