#include "SaleRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<std::string, DatabaseError> SaleRepository::Create(const Sales& entity)
{
    try
    {
        return Mapper().insertFuture(entity).get().getValueOfId();
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<Sales, DatabaseError> SaleRepository::GetByID(std::string id)
{
    try
    {
        return Mapper().findByPrimaryKey(id);
    }
    catch (const UnexpectedRows& e)
    {
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> SaleRepository::Update(std::string id, const Sales& entity)
{
    try
    {
        auto numUpdated = Mapper().update(entity);
        if (numUpdated)
        {
            return true;
        }
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> SaleRepository::Delete(std::string id)
{
    try
    {
        if (Mapper().deleteByPrimaryKey(id))
        {
            return true;
        }
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sales>, DatabaseError> SaleRepository::ReadAll()
{
    try
    {
        return Mapper().findAll();
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> SaleRepository::Exists(std::string id)
{
    try
    {
        Mapper().findByPrimaryKey(id);
        return true;
    }
    catch (const UnexpectedRows& e)
    {
        return false;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sales>, DatabaseError> SaleRepository::FindByProductId(const std::string& productId)
{
    try
    {
        return Mapper().findBy(Criteria(Sales::Cols::_product_id, CompareOperator::EQ, productId));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sales>, DatabaseError> SaleRepository::FindByBuyerId(const std::string& buyerId)
{
    try
    {
        return Mapper().findBy(Criteria(Sales::Cols::_buyer_id, CompareOperator::EQ, buyerId));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sales>, DatabaseError> SaleRepository::FindByStatus(const std::string& status)
{
    try
    {
        return Mapper().findBy(Criteria(Sales::Cols::_status, CompareOperator::EQ, status));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sales>, DatabaseError> SaleRepository::FindByDateRange(const ::trantor::Date& start, const ::trantor::Date& end)
{
    try
    {
        auto criteria = Criteria(Sales::Cols::_purchased_at, CompareOperator::GE, start) &&
                        Criteria(Sales::Cols::_purchased_at, CompareOperator::LE, end);
        return Mapper().findBy(criteria);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

}