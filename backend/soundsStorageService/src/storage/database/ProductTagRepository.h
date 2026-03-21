#pragma once

#include <vector>
#include <variant>
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

    std::variant<bool, DatabaseError> AddTagToProduct(const std::string& productId, const std::string& tagId);
    std::variant<bool, DatabaseError> RemoveTagFromProduct(const std::string& productId, const std::string& tagId);
    std::variant<std::vector<std::string>, DatabaseError> GetTagsByProductId(const std::string& productId);
    std::variant<std::vector<std::string>, DatabaseError> GetProductsByTagId(const std::string& tagId);
    std::variant<bool, DatabaseError> Exists(const std::string& productId, const std::string& tagId);

private:
    drogon::orm::DbClientPtr GetDbClient() const
    {
        return drogon::app().getDbClient();
    }
};

}