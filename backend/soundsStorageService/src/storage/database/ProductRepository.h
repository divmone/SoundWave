#pragma once

#include <vector>
#include <variant>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Products.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class ProductRepository : public IDatabaseRepository<Products, std::string, DatabaseError>
{
    static constexpr uint64_t PAGE_SIZE = 9;
public:
    ProductRepository() = default;
    ~ProductRepository() = default;

    std::variant<std::string, DatabaseError> Create(const Products& entity) override;
    std::variant<Products, DatabaseError> GetByID(std::string id) override;
    std::variant<bool, DatabaseError> Update(std::string id, const Products& entity) override;
    std::variant<bool, DatabaseError> Delete(std::string id) override;
    std::variant<bool, DatabaseError> Exists(std::string id) override;
    std::variant<uint64_t, DatabaseError> GetAmount();

    std::variant<std::vector<Products>, DatabaseError> GetPage(uint64_t pageNum);
    std::variant<std::vector<Products>, DatabaseError> ReadAll() override;
    std::variant<std::vector<Products>, DatabaseError> FindByAuthorId(const std::string& authorId);
    std::variant<std::vector<Products>, DatabaseError> FindBySoundId(const std::string& soundId);
    std::variant<std::vector<Products>, DatabaseError> FindPublished();
    std::variant<std::vector<Products>, DatabaseError> FindByPriceRange(const std::string& minPrice, const std::string& maxPrice);
};

}