// ProductRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Products.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class ProductRepository : public IDatabaseRepository<Products, uint64_t, DatabaseError>
{
    static constexpr uint64_t PAGE_SIZE = 9;
public:
    ProductRepository() = default;
    ~ProductRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const Products& entity) override;
    std::variant<Products, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const Products& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<uint64_t, DatabaseError> GetAmount();

    std::variant<std::vector<Products>, DatabaseError> GetPage(uint64_t pageNum);
    std::variant<std::vector<Products>, DatabaseError> ReadAll() override;
    std::variant<std::vector<Products>, DatabaseError> FindByAuthorId(uint64_t authorId);
    std::variant<std::vector<Products>, DatabaseError> FindBySoundId(uint64_t soundId);
    std::variant<std::vector<Products>, DatabaseError> FindPublished();
    std::variant<std::vector<Products>, DatabaseError> FindByPriceRange(const std::string& minPrice, const std::string& maxPrice);
};

}