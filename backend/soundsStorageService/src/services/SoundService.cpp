// SoundService.cpp
#include <services/SoundService.h>
#include <storage/database/SoundRepository.h>
#include <mapping/SoundMapper.h>
#include <exceptions/DatabaseException.h>
#include <exceptions/NotFoundException.h>

namespace soundwaveSounds
{

using namespace dto;

SoundService::SoundService(std::shared_ptr<SoundRepository> repository)
    : m_dao(repository)
{
}

SoundResponseTo SoundService::Create(const SoundRequestTo& request)
{
    request.validate();

    auto entity = SoundMapper::ToEntity(request);
    auto result = m_dao->Create(entity);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Sound already exists");
    }

    auto id = std::get<uint64_t>(result);
    auto getResult = m_dao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve created sound");
    }

    return SoundMapper::ToResponse(std::get<Sounds>(getResult));
}

SoundResponseTo SoundService::Read(uint64_t id)
{
    auto result = m_dao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Sound not found");
        }
        throw DatabaseException("Failed to retrieve sound");
    }

    return SoundMapper::ToResponse(std::get<Sounds>(result));
}

SoundResponseTo SoundService::Update(const SoundRequestTo& request, uint64_t id)
{
    request.validate();

    auto entity = SoundMapper::ToEntityForUpdate(request, id);
    auto updateResult = m_dao->Update(id, entity);

    if (std::holds_alternative<DatabaseError>(updateResult))
    {
        auto error = std::get<DatabaseError>(updateResult);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Sound not found for update");
        }
        throw DatabaseException("Failed to update sound");
    }

    auto getResult = m_dao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve updated sound");
    }

    return SoundMapper::ToResponse(std::get<Sounds>(getResult));
}

bool SoundService::Delete(uint64_t id)
{
    auto result = m_dao->Delete(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Sound not found for deletion");
        }
        throw DatabaseException("Failed to delete sound");
    }

    return std::get<bool>(result);
}

std::vector<SoundResponseTo> SoundService::GetAll()
{
    auto result = m_dao->ReadAll();

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve all sounds");
    }

    return SoundMapper::ToResponseList(std::get<std::vector<Sounds>>(result));
}

std::vector<SoundResponseTo> SoundService::GetByUserId(uint64_t userId)
{
    auto result = m_dao->FindByUserId(userId);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve sounds by user ID");
    }

    return SoundMapper::ToResponseList(std::get<std::vector<Sounds>>(result));
}

std::vector<SoundResponseTo> SoundService::GetByFilename(const std::string& filename)
{
    auto result = m_dao->FindByFilename(filename);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve sounds by filename");
    }

    return SoundMapper::ToResponseList(std::get<std::vector<Sounds>>(result));
}

}