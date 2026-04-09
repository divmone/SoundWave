// SoundRepository.cpp
#include "SoundRepository.h"

using namespace soundwaveSounds;
using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> SoundRepository::Create(const Sounds& entity)
{
    try
    {
        /*
            от штуки ниже нет смысла. и она еще всё сломала
        */
        /*
        auto existing = Mapper().findBy(Criteria(Sounds::Cols::_file_path, CompareOperator::EQ, entity.getValueOfFilename()));
        if (existing.size())
        {
            LOG_INFO << *existing[0].getFilePath() << "already exists in database";
            return DatabaseError::AlreadyExists;
        }*/
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


std::variant<std::vector<Sounds>, DatabaseError> SoundRepository::FindByTagIds(const std::vector<uint64_t>& tagIds)
{
    if (tagIds.empty())
    {
        return std::vector<Sounds>();
    }

    try
    {
        auto client = drogon::app().getDbClient();

        std::string tagIdsStr;
        for (size_t i = 0; i < tagIds.size(); ++i)
        {
            if (i > 0) tagIdsStr += ", ";
            tagIdsStr += std::to_string(tagIds[i]);
        }

        std::string sql = R"(
            SELECT s.* FROM sounds s
            INNER JOIN sound_tags st ON s.id = st.sound_id
            WHERE st.tag_id IN ()" + tagIdsStr + R"()
            GROUP BY s.id
            HAVING COUNT(DISTINCT st.tag_id) = )" + std::to_string(tagIds.size()) + R"(
            ORDER BY s.created_at DESC
        )";

        auto result = client->execSqlSync(sql);

        std::vector<Sounds> sounds;
        for (const auto& row : result)
        {
            sounds.emplace_back(row);
        }

        return sounds;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown: " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

