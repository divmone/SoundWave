#include "SoundRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<std::string, DatabaseError> SoundRepository::Create(const Sounds& entity)
{
    try
    {
        auto soundWithSameFilename = Mapper().findBy(Criteria(Sounds::Cols::_filename, CompareOperator::EQ, entity.getValueOfFilename()));
        if (soundWithSameFilename.size())
        {
            return DatabaseError::AlreadyExists;
        }
        
        return Mapper().insertFuture(entity).get().getValueOfId();
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<Sounds, DatabaseError> SoundRepository::GetByID(std::string id)
{
    try
    {
        auto result = Mapper().findByPrimaryKey(id);
        return result;
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

std::variant<bool, DatabaseError> SoundRepository::Update(std::string id, const Sounds& entity)
{
    try
    {
        auto numUpdated = Mapper().update(entity);
        if (numUpdated)
        {
            return true;
        }
        else
        {
            return DatabaseError::NotFound;
        }
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> SoundRepository::Delete(std::string id)
{
    try
    {
        if (Mapper().deleteByPrimaryKey(id))
        {
            return true;
        }
        else
        {
            return DatabaseError::NotFound;
        }
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

std::variant<bool, DatabaseError> SoundRepository::Exists(std::string id)
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

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByUserId(const std::string& userId)
{
    try
    {
        auto criteria = Criteria(Sounds::Cols::_user_id, CompareOperator::EQ, userId);
        return Mapper().findBy(criteria);
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
        auto criteria = Criteria(Sounds::Cols::_filename, CompareOperator::EQ, filename);
        return Mapper().findBy(criteria);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByMimeType(const std::string& mimeType)
{
    try
    {
        auto criteria = Criteria(Sounds::Cols::_mime_type, CompareOperator::EQ, mimeType);
        return Mapper().findBy(criteria);
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

}