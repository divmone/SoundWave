// PurchaseRepository.cpp
#include "PurchaseRepository.h"

namespace soundwavePayment
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> PurchaseRepository::Create(const Purchases& entity)
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

std::variant<Purchases, DatabaseError> PurchaseRepository::GetByID(uint64_t id)
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

std::variant<bool, DatabaseError> PurchaseRepository::Update(uint64_t id, const Purchases& entity)
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

std::variant<bool, DatabaseError> PurchaseRepository::Delete(uint64_t id)
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

std::variant<bool, DatabaseError> PurchaseRepository::Exists(uint64_t id)
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

std::variant<std::vector<Purchases>, DatabaseError> PurchaseRepository::ReadAll()
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

std::variant<std::vector<Purchases>, DatabaseError> PurchaseRepository::GetByUserId(int32_t userId)
{
    try
    {
        return Mapper().findBy(Criteria(Purchases::Cols::_user_id, CompareOperator::EQ, userId));
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Purchases>, DatabaseError> PurchaseRepository::GetByProductId(int64_t productId)
{
    try
    {
        return Mapper().findBy(Criteria(Purchases::Cols::_product_id, CompareOperator::EQ, productId));
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> PurchaseRepository::CheckUserHasPurchased(int32_t userId, int64_t productId)
{
    try
    {
        auto criteria = Criteria(Purchases::Cols::_user_id, CompareOperator::EQ, userId) && 
                    Criteria(Purchases::Cols::_product_id, CompareOperator::EQ, productId) &&
                    Criteria(Purchases::Cols::_is_active, CompareOperator::EQ, true);
        auto results = Mapper().findBy(criteria);
        return !results.empty();
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<Purchases, DatabaseError> PurchaseRepository::GetUserPurchase(int32_t userId, int64_t productId)
{
    try
    {
        auto criteria = Criteria(Purchases::Cols::_user_id, CompareOperator::EQ, userId) && 
                    Criteria(Purchases::Cols::_product_id, CompareOperator::EQ, productId) &&
                    Criteria(Purchases::Cols::_is_active, CompareOperator::EQ, true);
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

std::variant<bool, DatabaseError> PurchaseRepository::UpdateStatus(uint64_t id, bool isActive)
{
    try
    {
        auto entity = Mapper().findByPrimaryKey(id);
        entity.setIsActive(isActive);
        auto numUpdated = Mapper().update(entity);
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

std::variant<bool, DatabaseError> PurchaseRepository::MarkAsRefunded(uint64_t id, const std::string& reason)
{
    try
    {
        auto entity = Mapper().findByPrimaryKey(id);
        entity.setIsActive(false);
        entity.setRefundReason(reason);
        entity.setRefundedAt(trantor::Date::now());
        auto numUpdated = Mapper().update(entity);
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