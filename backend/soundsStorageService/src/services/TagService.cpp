// TagService.cpp
#include <services/TagService.h>
#include <mapping/TagMapper.h>
#include <exceptions/DatabaseException.h>
#include <exceptions/NotFoundException.h>

namespace soundwaveSounds
{

using namespace dto;

TagService::TagService(std::shared_ptr<TagRepository> repository)
    : m_dao(repository)
{
}

TagResponseTo TagService::Create(const TagRequestTo& request)
{
    request.validate();

    auto entity = TagMapper::ToEntity(request);
    auto result = m_dao->Create(entity);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to create tag");
    }

    auto id = std::get<uint64_t>(result);
    auto getResult = m_dao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve created tag");
    }

    return TagMapper::ToResponse(std::get<Tags>(getResult));
}

TagResponseTo TagService::Read(uint64_t id)
{
    auto result = m_dao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Tag not found");
        }
        throw DatabaseException("Failed to retrieve tag");
    }

    return TagMapper::ToResponse(std::get<Tags>(result));
}

TagResponseTo TagService::Update(const TagRequestTo& request, uint64_t id)
{
    request.validate();

    auto entity = TagMapper::ToEntityForUpdate(request, id);
    auto updateResult = m_dao->Update(id, entity);

    if (std::holds_alternative<DatabaseError>(updateResult))
    {
        auto error = std::get<DatabaseError>(updateResult);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Tag not found for update");
        }
        throw DatabaseException("Failed to update tag");
    }

    auto getResult = m_dao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve updated tag");
    }

    return TagMapper::ToResponse(std::get<Tags>(getResult));
}

bool TagService::Delete(uint64_t id)
{
    auto result = m_dao->Delete(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Tag not found for deletion");
        }
        throw DatabaseException("Failed to delete tag");
    }

    return std::get<bool>(result);
}

std::vector<TagResponseTo> TagService::GetAll()
{
    auto result = m_dao->ReadAll();

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve all tags");
    }

    return TagMapper::ToResponseList(std::get<std::vector<Tags>>(result));
}

TagResponseTo TagService::GetByName(const std::string& name)
{
    auto result = m_dao->FindByName(name);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Tag not found");
        }
        throw DatabaseException("Failed to retrieve tag by name");
    }

    return TagMapper::ToResponse(std::get<Tags>(result));
}

std::vector<TagResponseTo> TagService::GetByNames(const std::vector<std::string>& names)
{
    auto result = m_dao->FindByNames(names);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve tags by names");
    }

    return TagMapper::ToResponseList(std::get<std::vector<Tags>>(result));
}

}