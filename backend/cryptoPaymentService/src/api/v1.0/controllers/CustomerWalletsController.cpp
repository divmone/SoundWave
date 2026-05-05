//
// Created by dmitry on 05.05.2026.
//

#include "CustomerWalletsController.h"
#include <json/json.h>
#include <drogon/HttpTypes.h>
#include <exceptions/ValidationException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/DatabaseException.h>
#include <trantor/utils/Logger.h>
#include <dto/requests/CustomerWalletRequestTo.h>

namespace soundwaveCryptoPayment
{

using namespace drogon;

CustomerWalletsController::CustomerWalletsController(std::unique_ptr<CustomerWalletsService> service)
    : m_service(std::move(service))
{

}

void CustomerWalletsController::GetCustomerWallets(
    const HttpRequestPtr& req,
    std::function<void(const HttpResponsePtr&)> &&callback,
    uint64_t userId)
{
    LOG_INFO << "GET /api/v1.0/customerWallets/" << userId;

    try
    {
        auto result = m_service->GetWallets(userId);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto response = HttpResponse::newHttpResponse();
            response->setStatusCode(k500InternalServerError);
            response->setContentTypeCode(CT_APPLICATION_JSON);
            Json::Value body;
            body["error"] = "Failed to retrieve wallets";
            response->setBody(body.toStyledString());
            callback(response);
            return;
        }

        auto& wallets = std::get<std::vector<CustomerWalletResponseTo>>(result);

        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k200OK);
        response->setContentTypeCode(CT_APPLICATION_JSON);

        Json::Value body(Json::arrayValue);
        for (auto& wallet : wallets)
        {
            body.append(wallet.wallet);
        }

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

void CustomerWalletsController::AddCustomerWallet(
    const HttpRequestPtr& req,
    std::function<void(const HttpResponsePtr&)> &&callback,
    uint64_t userId)
{
    LOG_INFO << "POST /api/v1.0/customerWallets/" << userId;

    try
    {
        auto json = req->getJsonObject();
        if (!json || !json->isMember("wallet"))
        {
            throw ValidationException("Missing 'wallet' field in request body");
        }

        std::string wallet = (*json)["wallet"].asString();

        CustomerWalletRequestTo dto;
        dto.userId = userId;
        dto.wallet = wallet;

        auto result = m_service->AddWallet(dto);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto err = std::get<DatabaseError>(result);
            auto response = HttpResponse::newHttpResponse();

            if (err == DatabaseError::AlreadyExists)
            {
                response->setStatusCode(k409Conflict);
                Json::Value body;
                body["error"] = "Wallet already exists for this user";
                response->setBody(body.toStyledString());
            }
            else
            {
                response->setStatusCode(k500InternalServerError);
                Json::Value body;
                body["error"] = "Failed to add wallet";
                response->setBody(body.toStyledString());
            }

            callback(response);
            return;
        }

        auto& walletResponse = std::get<CustomerWalletResponseTo>(result);

        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k201Created);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        response->setBody(walletResponse.toJson().toStyledString());
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

void CustomerWalletsController::DeleteCustomerWallet(
    const HttpRequestPtr& req,
    std::function<void(const HttpResponsePtr&)> &&callback,
    uint64_t userId)
{
    LOG_INFO << "DELETE /api/v1.0/customerWallets/" << userId;

    try
    {
        auto json = req->getJsonObject();
        if (!json || !json->isMember("wallet"))
        {
            throw ValidationException("Missing 'wallet' field in request body");
        }

        std::string wallet = (*json)["wallet"].asString();

        CustomerWalletRequestTo dto;
        dto.userId = userId;
        dto.wallet = wallet;

        auto result = m_service->DeleteWallet(dto);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto response = HttpResponse::newHttpResponse();
            response->setStatusCode(k500InternalServerError);
            response->setContentTypeCode(CT_APPLICATION_JSON);
            Json::Value body;
            body["error"] = "Failed to delete wallet";
            response->setBody(body.toStyledString());
            callback(response);
            return;
        }

        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k204NoContent);
        callback(response);
    }
    catch (const NotFoundException& e)
    {
        auto response = HttpResponse::newHttpResponse();
        response->setStatusCode(k404NotFound);
        response->setContentTypeCode(CT_APPLICATION_JSON);
        Json::Value body;
        body["error"] = e.what();
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
