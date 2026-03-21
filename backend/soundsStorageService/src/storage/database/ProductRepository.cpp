#include "ProductRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<std::string, DatabaseError> ProductRepository::Create(const Products& entity)
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

std::variant<Products, DatabaseError> ProductRepository::GetByID(std::string id)
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

std::variant<bool, DatabaseError> ProductRepository::Update(std::string id, const Products& entity)
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

std::variant<bool, DatabaseError> ProductRepository::Delete(std::string id)
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

std::variant<std::vector<Products>, DatabaseError> ProductRepository::ReadAll()
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

std::variant<bool, DatabaseError> ProductRepository::Exists(std::string id)
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

std::variant<std::vector<Products>, DatabaseError> ProductRepository::FindByAuthorId(const std::string& authorId)
{
    try
    {
        return Mapper().findBy(Criteria(Products::Cols::_author_id, CompareOperator::EQ, authorId));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Products>, DatabaseError> ProductRepository::FindBySoundId(const std::string& soundId)
{
    try
    {
        return Mapper().findBy(Criteria(Products::Cols::_sound_id, CompareOperator::EQ, soundId));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Products>, DatabaseError> ProductRepository::FindPublished()
{
    try
    {
        return Mapper().findBy(Criteria(Products::Cols::_is_published, CompareOperator::EQ, true));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Products>, DatabaseError> ProductRepository::FindByPriceRange(const std::string& minPrice, const std::string& maxPrice)
{
    try
    {
        auto criteria = Criteria(Products::Cols::_price, CompareOperator::GE, minPrice) &&
                        Criteria(Products::Cols::_price, CompareOperator::LE, maxPrice);
        return Mapper().findBy(criteria);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

}