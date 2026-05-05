//
// Created by dmitry on 05.05.2026.
//

#include "TransactionsService.h"
#include <mapping/TransactionsMapper.h>
#include <trantor/utils/Logger.h>
#include <json/json.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <drogon/HttpClient.h>
#include <sstream>
#include <iomanip>
#include <cmath>

namespace soundwaveCryptoPayment
{
    TransactionsService::TransactionsService(std::unique_ptr<TransactionsRepository> repository)
        : m_repository(std::move(repository))
    {
        m_client = drogon::HttpClient::newHttpClient(ETHERSCAN_BASE_URL);
    }

    std::variant<TransactionResponseTo, DatabaseError>
        TransactionsService::CreateTransaction(const TransactionRequestTo& dto)
    {
        LOG_DEBUG << "Creating transaction for user: " << dto.userId << " product: " << dto.productId;

        auto result = m_repository->CreateTransaction(dto);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto err = std::get<DatabaseError>(result);
            LOG_ERROR << "Failed to create transaction for user " << dto.userId;
            return err;
        }

        auto response = std::get<TransactionResponseTo>(result);
        return response;
    }

    std::variant<TransactionResponseTo, DatabaseError>
        TransactionsService::GetTransaction(int64_t id)
    {
        LOG_DEBUG << "Getting transaction with id: " << id;

        auto result = m_repository->GetTransactionById(id);

        if (std::holds_alternative<DatabaseError>(result))
        {
            auto err = std::get<DatabaseError>(result);
            if (err == DatabaseError::NotFound)
            {
                return err;
            }
            LOG_ERROR << "Failed to get transaction " << id;
            return err;
        }

        auto response = std::get<TransactionResponseTo>(result);

        if (response.state == "pending")
        {
            auto updatedResult = CheckAndUpdateTransactionStatus(id);
            if (!std::holds_alternative<DatabaseError>(updatedResult))
            {
                response = std::get<TransactionResponseTo>(updatedResult);
            }
        }

        return response;
    }

    std::variant<TransactionResponseTo, DatabaseError>
        TransactionsService::ClaimTransaction(int64_t id, int64_t userId)
    {
        LOG_DEBUG << "Claiming transaction " << id << " for user " << userId;

        auto result = m_repository->GetTransactionById(id);

        if (std::holds_alternative<DatabaseError>(result))
        {
            return std::get<DatabaseError>(result);
        }

        auto response = std::get<TransactionResponseTo>(result);

        if (response.userId != userId)
        {
            LOG_WARN << "User " << userId << " attempted to claim transaction " << id << " belonging to user " << response.userId;
            return DatabaseError::NotFound;
        }

        if (response.state != "approved")
        {
            LOG_WARN << "Transaction " << id << " is not in paid state, current state: " << response.state;
            return DatabaseError::Unknown;
        }

        return response;
    }

    bool TransactionsService::VerifyTransactionOnBlockchain(
        const std::string& txhash,
        const std::string& from,
        int32_t amount)
    {
        LOG_DEBUG << "Verifying transaction " << txhash << " on blockchain";

        try
        {
            auto req = drogon::HttpRequest::newHttpRequest();
            req->setMethod(drogon::Get);

            std::stringstream ss;
            ss << "/api?module=proxy&action=eth_getTransactionByHash&txhash=" << txhash
               << "&apikey=" << ETHERSCAN_API_KEY
               << "&chainid=" << SEPOLIA_CHAIN_ID;
            req->setPath(ss.str());

            auto [result, response] = m_client->sendRequest(req, 10);

            if (result != drogon::ReqResult::Ok || !response)
            {
                LOG_ERROR << "Failed to send request to Etherscan API";
                return false;
            }

            int statusCode = response->getStatusCode();
            if (statusCode != 200)
            {
                LOG_ERROR << "Etherscan API returned status code: " << statusCode;
                return false;
            }

            auto jsonBody = response->getJsonObject();
            if (!jsonBody)
            {
                LOG_ERROR << "Failed to parse Etherscan API response";
                return false;
            }

            if (!jsonBody->isMember("result") || (*jsonBody)["result"].isNull())
            {
                LOG_ERROR << "Etherscan API returned null result for txhash: " << txhash;
                return false;
            }

            auto& resultObj = (*jsonBody)["result"];

            std::string txFrom = resultObj.isMember("from") ? resultObj["from"].asString() : "";
            std::string txTo = resultObj.isMember("to") ? resultObj["to"].asString() : "";
            std::string valueWei = resultObj.isMember("value") ? resultObj["value"].asString() : "0x0";

            LOG_DEBUG << "Transaction from: " << txFrom << " to: " << txTo << " value: " << valueWei;

            if (txFrom != from)
            {
                LOG_WARN << "Transaction from address mismatch. Expected: " << from << " Got: " << txFrom;
                return false;
            }

            if (txTo != WALLET_ADDRESS)
            {
                LOG_WARN << "Transaction to address mismatch. Expected: " << WALLET_ADDRESS << " Got: " << txTo;
                return false;
            }

            int64_t valueInWei = std::stoull(valueWei.substr(2), nullptr, 16);
            double valueInEth = static_cast<double>(valueInWei) / 1e18;
            int32_t valueInEthInt = static_cast<int32_t>(std::round(valueInEth));

            if (std::abs(valueInEthInt - amount) > 0)
            {
                LOG_WARN << "Transaction amount mismatch. Expected: " << amount << " Got: " << valueInEthInt;
                return false;
            }

            req = drogon::HttpRequest::newHttpRequest();
            req->setMethod(drogon::Get);

            std::stringstream ss2;
            ss2 << "/api?module=transaction&action=gettxreceiptstatus&txhash=" << txhash
                << "&apikey=" << ETHERSCAN_API_KEY
                << "&chainid=" << SEPOLIA_CHAIN_ID;
            req->setPath(ss2.str());

            auto [result2, response2] = m_client->sendRequest(req, 10);

            if (result2 != drogon::ReqResult::Ok || !response2)
            {
                LOG_ERROR << "Failed to send receipt status request to Etherscan API";
                return false;
            }

            auto jsonBody2 = response2->getJsonObject();
            if (!jsonBody2 || !jsonBody2->isMember("result"))
            {
                LOG_ERROR << "Failed to parse Etherscan receipt status response";
                return false;
            }

            auto& receiptResult = (*jsonBody2)["result"];
            if (receiptResult.isMember("status"))
            {
                std::string status = receiptResult["status"].asString();
                if (status != "1")
                {
                    LOG_WARN << "Transaction receipt status is not success: " << status;
                    return false;
                }
            }

            return true;
        }
        catch (const std::exception& e)
        {
            LOG_ERROR << "Exception during blockchain verification: " << e.what();
            return false;
        }
    }

    std::variant<TransactionResponseTo, DatabaseError>
        TransactionsService::CheckAndUpdateTransactionStatus(int64_t id)
    {
        auto result = m_repository->GetTransactionById(id);

        if (std::holds_alternative<DatabaseError>(result))
        {
            return std::get<DatabaseError>(result);
        }

        auto response = std::get<TransactionResponseTo>(result);

        if (response.state != "pending")
        {
            return response;
        }

        bool verified = VerifyTransactionOnBlockchain(
            response.txhash,
            response.from,
            response.amount
        );

        if (verified)
        {
            m_repository->UpdateTransactionState(id, "paid");
            response.state = "paid";
            LOG_INFO << "Transaction " << id << " verified and marked as paid";
        }
        else
        {
            m_repository->UpdateTransactionState(id, "failed");
            response.state = "failed";
            LOG_INFO << "Transaction " << id << " verification failed";
        }

        return response;
    }
}
