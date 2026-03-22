// ProductTagRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/HttpAppFramework.h>
#include <models/ProductTags.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class ProductTagRepository
{
public:
    ProductTagRepository() = default;
    ~ProductTagRepository() = default;

    std::variant<bool, DatabaseError> AddTagToProduct(uint64_t productId, uint64_t tagId);
    std::variant<bool, DatabaseError> RemoveTagFromProduct(uint64_t productId, uint64_t tagId);
    std::variant<std::vector<uint64_t>, DatabaseError> GetTagsByProductId(uint64_t productId);
    std::variant<std::vector<uint64_t>, DatabaseError> GetProductsByTagId(uint64_t tagId);
    std::variant<bool, DatabaseError> Exists(uint64_t productId, uint64_t tagId);

private:
    drogon::orm::DbClientPtr GetDbClient() const
    {
        return drogon::app().getDbClient();
    }
};

}