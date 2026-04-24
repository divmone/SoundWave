// StripeCustomerRepository.cpp
#include "StripeCustomerRepository.h"

namespace soundwavePayment
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> StripeCustomerRepository::Create(const StripeCustomers& entity)
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

std::variant<StripeCustomers, DatabaseError> StripeCustomerRepository::GetByID(uint64_t id)
{
    try
    {
        return Mapper().findByPrimaryKey(id);
    }
    catch (const UnexpectedRows&)
    {
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> StripeCustomerRepository::Update(uint64_t id, const StripeCustomers& entity)
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

std::variant<bool, DatabaseError> StripeCustomerRepository::Delete(uint64_t id)
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

std::variant<bool, DatabaseError> StripeCustomerRepository::Exists(uint64_t id)
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

std::variant<std::vector<StripeCustomers>, DatabaseError> StripeCustomerRepository::ReadAll()
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

std::variant<StripeCustomers, DatabaseError> StripeCustomerRepository::GetByUserId(int32_t userId)
{
    try
    {
        auto results = Mapper().findBy(Criteria(StripeCustomers::Cols::_user_id, CompareOperator::EQ, userId));
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

std::variant<StripeCustomers, DatabaseError> StripeCustomerRepository::GetByStripeCustomerId(const std::string& stripeCustomerId)
{
    try
    {
        auto results = Mapper().findBy(Criteria(StripeCustomers::Cols::_stripe_customer_id, CompareOperator::EQ, stripeCustomerId));
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

std::variant<bool, DatabaseError> StripeCustomerRepository::ExistsByUserId(int32_t userId)
{
    try
    {
        auto results = Mapper().findBy(Criteria(StripeCustomers::Cols::_user_id, CompareOperator::EQ, userId));
        return !results.empty();
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

}