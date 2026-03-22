// TagRepository.cpp
#include "TagRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> TagRepository::Create(const Tags& entity)
{
    try
    {
        auto existing = Mapper().findBy(Criteria(Tags::Cols::_name, CompareOperator::EQ, entity.getValueOfName()));
        if (existing.size())
        {
            return DatabaseError::AlreadyExists;
        }
        auto id = Mapper().insertFuture(entity).get().getValueOfId();
        return static_cast<uint64_t>(id);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<Tags, DatabaseError> TagRepository::GetByID(uint64_t id)
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

std::variant<bool, DatabaseError> TagRepository::Update(uint64_t id, const Tags& entity)
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

std::variant<bool, DatabaseError> TagRepository::Delete(uint64_t id)
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

std::variant<std::vector<Tags>, DatabaseError> TagRepository::ReadAll()
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

std::variant<bool, DatabaseError> TagRepository::Exists(uint64_t id)
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

std::variant<Tags, DatabaseError> TagRepository::FindByName(const std::string& name)
{
    try
    {
        auto results = Mapper().findBy(Criteria(Tags::Cols::_name, CompareOperator::EQ, name));
        if (results.empty())
        {
            return DatabaseError::NotFound;
        }
        return results[0];
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Tags>, DatabaseError> TagRepository::FindByNames(const std::vector<std::string>& names)
{
    try
    {
        auto criteria = Criteria(Tags::Cols::_name, CompareOperator::In, names);
        return Mapper().findBy(criteria);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

}