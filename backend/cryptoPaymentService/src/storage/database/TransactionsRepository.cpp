//
// Created by dmitry on 05.05.2026.
//

#include "TransactionsRepository.h"
#include <mapping/TransactionsMapper.h>
#include <drogon/orm/Criteria.h>

using namespace drogon;
using namespace drogon::orm;
using namespace drogon_model::soundwaveCryptoPayment;

namespace soundwaveCryptoPayment
{
    std::variant<TransactionResponseTo, DatabaseError>
        TransactionsRepository::CreateTransaction(const TransactionRequestTo& dto)
    {
        try
        {
            auto entity = toEntity(dto);
            auto result = Mapper().insertFuture(entity).get();

            TransactionResponseTo response;
            response.id = static_cast<std::int64_t>(result.getValueOfId());
            response.productId = dto.productId;
            response.state = "pending";
            response.amount = dto.amount;
            response.txhash = dto.txhash;
            response.userId = dto.userId;
            response.from = dto.from;
            response.to = dto.to;

            return response;
        }
        catch (const std::exception& e)
        {
            LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
            return DatabaseError::DatabaseError;
        }
    }

    std::variant<TransactionResponseTo, DatabaseError>
        TransactionsRepository::GetTransactionById(int64_t id)
    {
        try
        {
            auto transaction = Mapper().findByPrimaryKey(id);
            return toResponse(transaction);
        }
        catch (const UnexpectedRows& e)
        {
            return DatabaseError::NotFound;
        }
        catch (const std::exception& e)
        {
            LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
            return DatabaseError::DatabaseError;
        }
    }

    std::variant<bool, DatabaseError>
        TransactionsRepository::UpdateTransactionState(int64_t id, const std::string& state)
    {
        try
        {
            auto transaction = Mapper().findByPrimaryKey(id);
            transaction.setState(state);
            Mapper().update(transaction);
            return true;
        }
        catch (const UnexpectedRows& e)
        {
            return DatabaseError::NotFound;
        }
        catch (const std::exception& e)
        {
            LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
            return DatabaseError::DatabaseError;
        }
    }
}