// ProductRepository.cpp
#include "ProductRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> ProductRepository::Create(const Products& entity)
{
    try
    {
        auto id = Mapper().insertFuture(entity).get().getValueOfId();
        return static_cast<uint64_t>(id);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<Products, DatabaseError> ProductRepository::GetByID(uint64_t id)
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

std::variant<bool, DatabaseError> ProductRepository::Update(uint64_t id, const Products& entity)
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

std::variant<bool, DatabaseError> ProductRepository::Delete(uint64_t id)
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

std::variant<std::vector<Products>, DatabaseError> ProductRepository::GetPage(uint64_t pageNum)
{
    try
    {
        size_t offset = (pageNum - 1) * PAGE_SIZE;
        
        auto results = Mapper()
            .orderBy(Products::Cols::_created_at, SortOrder::DESC)
            .offset(offset)
            .limit(PAGE_SIZE)
            .findAll();
        
        if (results.empty())
        {
            return DatabaseError::NotFound;
        }
        
        return results;
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

std::variant<bool, DatabaseError> ProductRepository::Exists(uint64_t id)
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

std::variant<uint64_t, DatabaseError> ProductRepository::GetAmount()
{
    try
    {
        auto result = Mapper().count();
        return result;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Products>, DatabaseError> ProductRepository::FindByAuthorId(uint64_t authorId)
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

std::variant<std::vector<Products>, DatabaseError> ProductRepository::FindBySoundId(uint64_t soundId)
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