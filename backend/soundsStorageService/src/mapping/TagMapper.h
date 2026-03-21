#pragma once

#include <vector>
#include <models/Tags.h>
#include <dto/requests/TagRequestTo.h>
#include <dto/responses/TagResponseTo.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;
using namespace dto;

class TagMapper
{
public:
    static Tags ToEntity(const TagRequestTo& dto)
    {
        Tags entity;
        if (dto.id.has_value())
        {
            entity.setId(dto.id.value());
        }
        entity.setName(dto.name);
        return entity;
    }

    static Tags ToEntityForUpdate(const TagRequestTo& dto, const std::string& id)
    {
        Tags entity;
        entity.setId(id);
        entity.setName(dto.name);
        return entity;
    }

    static TagResponseTo ToResponse(const Tags& entity)
    {
        TagResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.name = entity.getValueOfName();
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<TagResponseTo> ToResponseList(const std::vector<Tags>& entities)
    {
        std::vector<TagResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}