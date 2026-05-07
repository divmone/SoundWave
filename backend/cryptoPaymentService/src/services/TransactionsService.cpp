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

        if (response.state != STATE_APPROVED)
        {
            LOG_WARN << "Transaction " << id << " is not in paid state, current state: " << response.state;
            return DatabaseError::Unknown;
        }

        return response;
    }

    TransactionsService::VerificationResult TransactionsService::VerifyTransactionOnBlockchain(
        const std::string& txhash,
        const std::string& from,
        const std::string& amount)
    {
        LOG_DEBUG << "Verifying transaction " << txhash << " on blockchain";

        try
        {
            /*
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
            std::string valueWeiHex = resultObj.isMember("value") ? resultObj["value"].asString() : "0x0";

            LOG_DEBUG << "Transaction from: " << txFrom << " to: " << txTo << " value: " << valueWeiHex;

            if (txFrom != from)
            {
                LOG_WARN << "Transaction from address mismatch. Expected: " << from << " Got: " << txFrom;
                return false;
            }

            if (txTo != WALLET)
            {
                LOG_WARN << "Transaction to address mismatch. Expected: " << WALLET << " Got: " << txTo;
                return false;
            }

            // amount comes in wei as decimal string, compare with the value from blockchain (hex)
            std::string amountWeiStr = amount; // already in decimal string
            // Convert valueWeiHex (hex) to decimal for comparison, or compare directly if possible
            // valueWeiHex is like "0x..." (hex), amount is decimal string
            // We'll compare by converting both to the same representation
            try {
                // Convert hex value to decimal string
                int64_t valueInWei = std::stoull(valueWeiHex.substr(2), nullptr, 16);
                std::string valueWeiDecimal = std::to_string(valueInWei);
                if (valueWeiDecimal != amountWeiStr)
                {
                    LOG_WARN << "Transaction amount mismatch. Expected: " << amountWeiStr << " Got: " << valueWeiDecimal;
                    return false;
                }
            } catch (...) {
                LOG_WARN << "Failed to parse transaction value for comparison";
                return false;
            }
            */
            auto req = drogon::HttpRequest::newHttpRequest();
            req->setMethod(drogon::Get);

            req->setPath("/v2/api");
            req->setParameter("module",  "transaction");
            req->setParameter("action",  "gettxreceiptstatus");
            req->setParameter("txhash",  txhash);
            req->setParameter("apikey",  ETHERSCAN_API_KEY);
            req->setParameter("chainid", SEPOLIA_CHAIN_ID);

            auto [result2, response2] = m_client->sendRequest(req, 10);

            if (result2 != drogon::ReqResult::Ok || !response2)
            {
                LOG_ERROR << "Failed to send receipt status request to Etherscan API";
                return VerificationResult::PENDING;
            }

            auto jsonBody2 = response2->getJsonObject();

            std::cout << jsonBody2 << std::endl;

            if (!jsonBody2 || !jsonBody2->isMember("result"))
            {
                LOG_ERROR << "Failed to parse Etherscan receipt status response";
                return VerificationResult::DECLINED;
            }

            auto& receiptResult = (*jsonBody2)["result"];

            if (receiptResult.isNull() || !receiptResult.isMember("status"))
            {
                LOG_DEBUG << "Transaction " << txhash << " is not yet mined (no receipt status)";
                return VerificationResult::PENDING;
            }

            std::string status = receiptResult["status"].asString();

            if (status == "")
            {
                return VerificationResult::PENDING;
            }
            if (status != "1")
            {
                LOG_WARN << "Transaction receipt status is not success: " << status;
                return VerificationResult::DECLINED;
            }

            return VerificationResult::APPROVED;
        }
        catch (const std::exception& e)
        {
            LOG_ERROR << "Exception during blockchain verification: " << e.what();
            return VerificationResult::DECLINED;
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

        auto verification = VerifyTransactionOnBlockchain(
            response.txhash,
            response.from,
            response.amount
        );

        if (verification == VerificationResult::APPROVED)
        {
            m_repository->UpdateTransactionState(id, STATE_APPROVED);
            response.state = STATE_APPROVED;
            LOG_INFO << "Transaction " << id << " verified and marked as approved";
        }
        else if (verification == VerificationResult::DECLINED)
        {
            m_repository->UpdateTransactionState(id, STATE_DECLINED);
            response.state = STATE_DECLINED;
            LOG_INFO << "Transaction " << id << " verification failed";
        }
        else // PENDING
        {
            LOG_DEBUG << "Transaction " << id << " is still pending (not mined yet)";
        }

        return response;
    }
}
