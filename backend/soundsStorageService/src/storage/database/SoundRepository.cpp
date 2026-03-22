// SoundRepository.cpp
#include "SoundRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> SoundRepository::Create(const Sounds& entity)
{
    try
    {
        auto existing = Mapper().findBy(Criteria(Sounds::Cols::_filename, CompareOperator::EQ, entity.getValueOfFilename()));
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

std::variant<Sounds, DatabaseError> SoundRepository::GetByID(uint64_t id)
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

std::variant<bool, DatabaseError> SoundRepository::Update(uint64_t id, const Sounds& entity)
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

std::variant<bool, DatabaseError> SoundRepository::Delete(uint64_t id)
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

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::ReadAll()
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

std::variant<bool, DatabaseError> SoundRepository::Exists(uint64_t id)
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

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByUserId(uint64_t userId)
{
    try
    {
        return Mapper().findBy(Criteria(Sounds::Cols::_user_id, CompareOperator::EQ, userId));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByFilename(const std::string& filename)
{
    try
    {
        return Mapper().findBy(Criteria(Sounds::Cols::_filename, CompareOperator::EQ, filename));
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

}