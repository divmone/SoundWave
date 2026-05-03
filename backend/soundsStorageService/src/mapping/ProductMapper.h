// ProductMapper.h
#pragma once

#include <vector>
#include <cstdint>
#include <models/Products.h>
#include <models/Tags.h>
#include <dto/requests/ProductRequestTo.h>
#include <dto/responses/ProductResponseTo.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;
using namespace dto;

class ProductMapper
{
public:
    static Products ToEntity(const ProductRequestTo& dto)
    {
        Products entity;
        if (dto.id.has_value())
        {
            entity.setId(dto.id.value());
        }
        entity.setSoundId(dto.soundId);
        entity.setAuthorId(dto.authorId);
        entity.setTitle(dto.title);
        entity.setDescription(dto.description);
        entity.setPrice(dto.price);
        if (dto.rating.has_value())
        {
            entity.setRating(std::to_string(dto.rating.value()));
        }
        if (dto.downloadCount.has_value())
        {
            entity.setDownloadCount(dto.downloadCount.value());
        }
        if (dto.isPublished.has_value())
        {
            entity.setIsPublished(dto.isPublished.value());
        }
        entity.setIsAiSlop(dto.isAiSlop);
        return entity;
    }

    static Products ToEntityForUpdate(const ProductRequestTo& dto, uint64_t id)
    {
        Products entity;
        entity.setId(id);
        entity.setSoundId(dto.soundId);
        entity.setAuthorId(dto.authorId);
        entity.setTitle(dto.title);
        entity.setDescription(dto.description);
        entity.setPrice(dto.price);
        if (dto.rating.has_value())
        {
            entity.setRating(std::to_string(dto.rating.value()));
        }
        if (dto.downloadCount.has_value())
        {
            entity.setDownloadCount(dto.downloadCount.value());
        }
        if (dto.isPublished.has_value())
        {
            entity.setIsPublished(dto.isPublished.value());
        }
        return entity;
    }

    static ProductResponseTo ToResponse(const Products& entity, const std::vector<uint64_t>& tagIds = {}, const std::vector<std::string>& tagNames = {})
    {
        ProductResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.soundId = entity.getValueOfSoundId();
        dto.authorId = entity.getValueOfAuthorId();
        dto.title = entity.getValueOfTitle();
        dto.description = entity.getValueOfDescription();
        dto.price = entity.getValueOfPrice();
        dto.rating = std::stod(entity.getValueOfRating());
        dto.downloadCount = entity.getValueOfDownloadCount();
        dto.isPublished = entity.getValueOfIsPublished();
        dto.tagIds = tagIds;
        dto.tagNames = tagNames;
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        dto.updatedAt = entity.getValueOfUpdatedAt().toFormattedString(false);
        dto.isAiSlop = entity.getValueOfIsAiSlop();
        return dto;
    }

    static std::vector<ProductResponseTo> ToResponseList(const std::vector<Products>& entities)
    {
        std::vector<ProductResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}