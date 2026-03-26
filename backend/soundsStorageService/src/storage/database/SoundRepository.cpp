// SoundRepository.cpp
#include "SoundRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> SoundRepository::Create(const Sounds& entity)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        auto existing = Mapper().findBy(Criteria(Sounds::Cols::_file_path, CompareOperator::EQ, entity.getValueOfFilename()));
        if (existing.size())
        {
            LOG_INFO << *existing[0].getFilePath() << "already exists in database";
            return DatabaseError::AlreadyExists;
        }
       auto id = Mapper().insertFuture(entity).get().getValueOfId();
       return static_cast<uint64_t>(id);
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<Sounds, DatabaseError> SoundRepository::GetByID(uint64_t id)
{
    LOG_INFO << __PRETTY_FUNCTION__;
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> SoundRepository::Update(uint64_t id, const Sounds& entity)
{
    LOG_INFO << __PRETTY_FUNCTION__;
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> SoundRepository::Delete(uint64_t id)
{
    LOG_INFO << __PRETTY_FUNCTION__;
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::ReadAll()
{
    LOG_INFO << __PRETTY_FUNCTION__;
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

std::variant<bool, DatabaseError> SoundRepository::Exists(uint64_t id)
{
    LOG_INFO << __PRETTY_FUNCTION__;
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByUserId(uint64_t userId)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        return Mapper().findBy(Criteria(Sounds::Cols::_user_id, CompareOperator::EQ, userId));
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByFilename(const std::string& filename)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        return Mapper().findBy(Criteria(Sounds::Cols::_filename, CompareOperator::EQ, filename));
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

}