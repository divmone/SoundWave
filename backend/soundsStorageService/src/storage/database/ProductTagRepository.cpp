#include "ProductTagRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<bool, DatabaseError> ProductTagRepository::AddTagToProduct(const std::string& productId, const std::string& tagId)
{
    try
    {
        ProductTags entity;
        entity.setProductId(productId);
        entity.setTagId(tagId);
        bool needSelection = false;
        auto sql = entity.sqlForInserting(needSelection);
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId, tagId);
        return result.affectedRows() > 0;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> ProductTagRepository::RemoveTagFromProduct(const std::string& productId, const std::string& tagId)
{
    try
    {
        auto sql = ProductTags::sqlForDeletingByPrimaryKey();
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId, tagId);
        return result.affectedRows() > 0;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<std::string>, DatabaseError> ProductTagRepository::GetTagsByProductId(const std::string& productId)
{
    try
    {
        auto sql = "SELECT tag_id FROM product_tags WHERE product_id = $1";
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId);
        std::vector<std::string> tagIds;
        tagIds.reserve(result.size());
        for (const auto& row : result)
        {
            tagIds.push_back(row["tag_id"].as<std::string>());
        }
        return tagIds;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<std::string>, DatabaseError> ProductTagRepository::GetProductsByTagId(const std::string& tagId)
{
    try
    {
        auto sql = "SELECT product_id FROM product_tags WHERE tag_id = $1";
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, tagId);
        std::vector<std::string> productIds;
        productIds.reserve(result.size());
        for (const auto& row : result)
        {
            productIds.push_back(row["product_id"].as<std::string>());
        }
        return productIds;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> ProductTagRepository::Exists(const std::string& productId, const std::string& tagId)
{
    try
    {
        auto sql = "SELECT 1 FROM product_tags WHERE product_id = $1 AND tag_id = $2 LIMIT 1";
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId, tagId);
        return result.size() > 0;
    }
    catch(const std::exception& e)
    {
        return DatabaseError::DatabaseError;
    }
}

}