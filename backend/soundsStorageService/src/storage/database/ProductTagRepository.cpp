// ProductTagRepository.cpp
#include "ProductTagRepository.h"

namespace soundwaveSounds
{

using namespace drogon::orm;

std::variant<bool, DatabaseError> ProductTagRepository::AddTagToProduct(uint64_t productId, uint64_t tagId)
{
    LOG_INFO << __PRETTY_FUNCTION__;
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
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> ProductTagRepository::RemoveTagFromProduct(uint64_t productId, uint64_t tagId)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        auto sql = ProductTags::sqlForDeletingByPrimaryKey();
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId, tagId);
        return result.affectedRows() > 0;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<uint64_t>, DatabaseError> ProductTagRepository::GetTagsByProductId(uint64_t productId)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        auto sql = "SELECT tag_id FROM product_tags WHERE product_id = $1";
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId);
        std::vector<uint64_t> tagIds;
        tagIds.reserve(result.size());
        for (const auto& row : result)
        {
            tagIds.push_back(row["tag_id"].as<uint64_t>());
        }
        return tagIds;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<uint64_t>, DatabaseError> ProductTagRepository::GetProductsByTagId(uint64_t tagId)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        auto sql = "SELECT product_id FROM product_tags WHERE tag_id = $1";
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, tagId);
        std::vector<uint64_t> productIds;
        productIds.reserve(result.size());
        for (const auto& row : result)
        {
            productIds.push_back(row["product_id"].as<uint64_t>());
        }
        return productIds;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> ProductTagRepository::Exists(uint64_t productId, uint64_t tagId)
{
    LOG_INFO << __PRETTY_FUNCTION__;
    try
    {
        auto sql = "SELECT 1 FROM product_tags WHERE product_id = $1 AND tag_id = $2 LIMIT 1";
        auto db = GetDbClient();
        auto result = db->execSqlSync(sql, productId, tagId);
        return result.size() > 0;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

}