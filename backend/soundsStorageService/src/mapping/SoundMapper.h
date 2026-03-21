#pragma once

#include <vector>
#include <models/Sounds.h>
#include <dto/requests/SoundRequestTo.h>
#include <dto/responses/SoundResponseTo.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;
using namespace dto;

class SoundMapper
{
public:
    static Sounds ToEntity(const SoundRequestTo& dto)
    {
        Sounds entity;
        if (dto.id.has_value())
        {
            entity.setId(dto.id.value());
        }
        entity.setUserId(dto.userId);
        entity.setFilename(dto.filename);
        entity.setOriginalName(dto.originalName);
        entity.setFilePath(dto.filePath);
        entity.setFileSize(dto.fileSize);
        entity.setMimeType(dto.mimeType);
        entity.setDurationSeconds(dto.durationSeconds);
        return entity;
    }

    static Sounds ToEntityForUpdate(const SoundRequestTo& dto, const std::string& id)
    {
        Sounds entity;
        entity.setId(id);
        entity.setUserId(dto.userId);
        entity.setFilename(dto.filename);
        entity.setOriginalName(dto.originalName);
        entity.setFilePath(dto.filePath);
        entity.setFileSize(dto.fileSize);
        entity.setMimeType(dto.mimeType);
        entity.setDurationSeconds(dto.durationSeconds);
        return entity;
    }

    static SoundResponseTo ToResponse(const Sounds& entity)
    {
        SoundResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.userId = entity.getValueOfUserId();
        dto.filename = entity.getValueOfFilename();
        dto.originalName = entity.getValueOfOriginalName();
        dto.filePath = entity.getValueOfFilePath();
        dto.fileSize = entity.getValueOfFileSize();
        dto.mimeType = entity.getValueOfMimeType();
        dto.durationSeconds = entity.getValueOfDurationSeconds();
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        dto.updatedAt = entity.getValueOfUpdatedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<SoundResponseTo> ToResponseList(const std::vector<Sounds>& entities)
    {
        std::vector<SoundResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}