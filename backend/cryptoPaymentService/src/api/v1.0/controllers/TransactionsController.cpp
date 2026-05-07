//
// Created by dmitry on 05.05.2026.
//

#include "TransactionsController.h"
#include <json/json.h>
#include <drogon/HttpTypes.h>
#include <exceptions/ValidationException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/DatabaseException.h>
#include <trantor/utils/Logger.h>
#include <dto/requests/TransactionRequestTo.h>
#include <boost/stacktrace.hpp>

namespace soundwaveCryptoPayment
{

using namespace drogon;

TransactionsController::TransactionsController(std::unique_ptr<TransactionsService> service)
    : m_service(std::move(service))
{

}

void TransactionsController::CreateTransaction(
    const HttpRequestPtr& req,
    std::function<void(const HttpResponsePtr&)> &&callback)
{
    LOG_INFO << "POST /api/v1.0/transactions";

    try
    {
        auto json = req->getJsonObject();
        if (!json)
        {
            throw ValidationException("Missing or invalid JSON body");
        }

        if (!json->isMember("txhash") || !json->isMember("from") ||
            !json->isMember("amount") || !json->isMember("productId") ||
            !json->isMember("userId"))
        {
            throw ValidationException("Missing required fields: txhash, from, amount, productId, userId");
        }

        auto dto = TransactionRequestTo::fromJson(*json);

        if (dto.txhash.empty())
        {
            throw ValidationException("txhash cannot be empty");
        }

        auto result = m_service->CreateTransaction(dto);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto response = HttpResponse::newHttpResponse();
            response->setStatusCode(k500InternalServerError);
            response->setContentTypeCode(CT_APPLICATION_JSON);
            Json::Value body;
            body["error"] = "Failed to create transaction";
            response->setBody(body.toStyledString());
            callback(response);
            return;
        }

        auto& transactionResponse = std::get<TransactionResponseTo>(result);

        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k201Created);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        response->setBody(transactionResponse.toJson().toStyledString());
        callback(response);
    }
    catch (const ValidationException& e)
    {
        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k400BadRequest);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["error"] = e.what();
        response->setBody(body.toStyledString());
        callback(response);
    }
    catch (const std::exception& e)
    {
        std::cout << boost::stacktrace::stacktrace() << std::endl;
        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k500InternalServerError);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["error"] = e.what();
        response->setBody(body.toStyledString());
        callback(response);
    }
}

void TransactionsController::GetTransaction(
    const HttpRequestPtr& req,
    std::function<void(const HttpResponsePtr&)> &&callback,
    int64_t transactionId)
{
    LOG_INFO << "GET /api/v1.0/transactions/" << transactionId;

    try
    {
        auto result = m_service->GetTransaction(transactionId);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto err = std::get<DatabaseError>(result);
            auto response = HttpResponse::newHttpResponse();

            if (err == DatabaseError::NotFound)
            {
                response->setStatusCode(k404NotFound);
                Json::Value body;
                body["error"] = "Transaction not found";
                response->setBody(body.toStyledString());
            }
            else
            {
                response->setStatusCode(k500InternalServerError);
                Json::Value body;
                body["error"] = "Failed to get transaction";
                response->setBody(body.toStyledString());
            }

            callback(response);
            return;
        }

        auto& transactionResponse = std::get<TransactionResponseTo>(result);

        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k200OK);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        response->setBody(transactionResponse.toJson().toStyledString());
        callback(response);
    }
    catch (const std::exception& e)
    {
        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k500InternalServerError);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["error"] = e.what();
        response->setBody(body.toStyledString());
        callback(response);
    }
}

void TransactionsController::ClaimTransaction(
    const HttpRequestPtr& req,
    std::function<void(const HttpResponsePtr&)> &&callback,
    int64_t transactionId)
{
    LOG_INFO << "POST /api/v1.0/transactions/" << transactionId << "/claim";

    try
    {
        auto json = req->getJsonObject();
        if (!json || !json->isMember("userId"))
        {
            throw ValidationException("Missing 'userId' field in request body");
        }

        int64_t userId = (*json)["userId"].asInt64();

        auto result = m_service->ClaimTransaction(transactionId, userId);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto err = std::get<DatabaseError>(result);
            auto response = HttpResponse::newHttpResponse();

            if (err == DatabaseError::NotFound)
            {
                response->setStatusCode(k404NotFound);
                Json::Value body;
                body["error"] = "Transaction not found or does not belong to user";
                response->setBody(body.toStyledString());
            }
            else
            {
                response->setStatusCode(k400BadRequest);
                Json::Value body;
                body["error"] = "Transaction is not in paid state";
                response->setBody(body.toStyledString());
            }

            callback(response);
            return;
        }

        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k200OK);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["message"] = "Product successfully claimed";
        body["transactionId"] = static_cast<Json::Int64>(transactionId);
        response->setBody(body.toStyledString());
        callback(response);
    }
    catch (const ValidationException& e)
    {
        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k400BadRequest);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["error"] = e.what();
        response->setBody(body.toStyledString());
        callback(response);
    }
    catch (const std::exception& e)
    {
        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k500InternalServerError);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["error"] = e.what();
        response->setBody(body.toStyledString());
        callback(response);
    }
}

}
