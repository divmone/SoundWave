// PaymentMethodRepository.cpp
#include "PaymentMethodRepository.h"

namespace soundwavePayment
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> PaymentMethodRepository::Create(const PaymentMethods& entity)
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

std::variant<PaymentMethods, DatabaseError> PaymentMethodRepository::GetByID(uint64_t id)
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

std::variant<bool, DatabaseError> PaymentMethodRepository::Update(uint64_t id, const PaymentMethods& entity)
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

std::variant<bool, DatabaseError> PaymentMethodRepository::Delete(uint64_t id)
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

std::variant<bool, DatabaseError> PaymentMethodRepository::Exists(uint64_t id)
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

std::variant<std::vector<PaymentMethods>, DatabaseError> PaymentMethodRepository::ReadAll()
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

std::variant<std::vector<PaymentMethods>, DatabaseError> PaymentMethodRepository::GetByUserId(int32_t userId)
{
    try
    {
        return Mapper().findBy(Criteria(PaymentMethods::Cols::_user_id, CompareOperator::EQ, userId));
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<PaymentMethods, DatabaseError> PaymentMethodRepository::GetDefaultByUserId(int32_t userId)
{
    try
    {
        auto criteria = Criteria(PaymentMethods::Cols::_user_id, CompareOperator::EQ, userId) && 
                      Criteria(PaymentMethods::Cols::_is_default, CompareOperator::EQ, true);
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

std::variant<bool, DatabaseError> PaymentMethodRepository::SetDefault(uint64_t id, int32_t userId)
{
    try
    {
        auto existingCriteria = Criteria(PaymentMethods::Cols::_user_id, CompareOperator::EQ, userId) && 
                               Criteria(PaymentMethods::Cols::_is_default, CompareOperator::EQ, true);
        auto existing = Mapper().findBy(existingCriteria);
        for (auto& method : existing)
        {
            method.setIsDefault(false);
            Mapper().update(method);
        }

        auto method = Mapper().findByPrimaryKey(id);
        method.setIsDefault(true);
        auto numUpdated = Mapper().update(method);
        return numUpdated > 0;
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

std::variant<bool, DatabaseError> PaymentMethodRepository::Deactivate(uint64_t id)
{
    try
    {
        auto method = Mapper().findByPrimaryKey(id);
        method.setIsActive(false);
        auto numUpdated = Mapper().update(method);
        return numUpdated > 0;
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

}