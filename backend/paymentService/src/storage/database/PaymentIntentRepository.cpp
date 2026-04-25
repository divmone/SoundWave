// PaymentIntentRepository.cpp
#include "PaymentIntentRepository.h"

namespace soundwavePayment
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> PaymentIntentRepository::Create(const PaymentIntents& entity)
{
    try
    {
        auto id = Mapper().insertFuture(entity).get().getValueOfId();
        return static_cast<uint64_t>(id);
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<PaymentIntents, DatabaseError> PaymentIntentRepository::GetByID(uint64_t id)
{
    try
    {
        return Mapper().findByPrimaryKey(id);
    }
    catch (const drogon::orm::UnexpectedRows&)
    {
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> PaymentIntentRepository::Update(uint64_t id, const PaymentIntents& entity)
{
    try
    {
        auto numUpdated = Mapper().update(entity);
        if (numUpdated) return true;
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> PaymentIntentRepository::Delete(uint64_t id)
{
    try
    {
        if (Mapper().deleteByPrimaryKey(id)) return true;
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> PaymentIntentRepository::Exists(uint64_t id)
{
    try
    {
        auto result = Mapper().findByPrimaryKey(id);
        return true;
    }
    catch (const UnexpectedRows&)
    {
        return false;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<PaymentIntents>, DatabaseError> PaymentIntentRepository::ReadAll()
{
    try
    {
        return Mapper().findAll();
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<PaymentIntents>, DatabaseError> PaymentIntentRepository::GetByUserId(int32_t userId)
{
    try
    {
        return Mapper().findBy(Criteria(PaymentIntents::Cols::_user_id, CompareOperator::EQ, userId));
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<PaymentIntents, DatabaseError> PaymentIntentRepository::GetByStripePaymentIntentId(const std::string& stripePaymentIntentId)
{
    try
    {
        auto results = Mapper().findBy(Criteria(PaymentIntents::Cols::_stripe_payment_intent_id, CompareOperator::EQ, stripePaymentIntentId));
        if (results.empty())
        {
            return DatabaseError::NotFound;
        }
        return results[0];
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<PaymentIntents, DatabaseError> PaymentIntentRepository::GetByUserIdAndProductId(int32_t userId, int64_t productId)
{
    try
    {
        auto criteria = Criteria(PaymentIntents::Cols::_user_id, CompareOperator::EQ, userId) && 
                     Criteria(PaymentIntents::Cols::_product_id, CompareOperator::EQ, productId);
        auto results = Mapper().findBy(criteria);
        if (results.empty())
        {
            return DatabaseError::NotFound;
        }
        return results[0];
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> PaymentIntentRepository::ExpireOldIntents(int32_t userId, int64_t productId)
{
    try
    {
        auto criteria = Criteria(PaymentIntents::Cols::_user_id, CompareOperator::EQ, userId) && 
                     Criteria(PaymentIntents::Cols::_product_id, CompareOperator::EQ, productId) &&
                     Criteria(PaymentIntents::Cols::_status, CompareOperator::EQ, "pending");
        auto results = Mapper().findBy(criteria);
        for (auto& intent : results)
        {
            intent.setStatus("expired");
            Mapper().update(intent);
        }
        return true;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

}