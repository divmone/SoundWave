// SaleRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Sales.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class SaleRepository : public IDatabaseRepository<Sales, uint64_t, DatabaseError>
{
public:
    SaleRepository() = default;
    ~SaleRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const Sales& entity) override;
    std::variant<Sales, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const Sales& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<std::vector<Sales>, DatabaseError> ReadAll() override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;

    std::variant<std::vector<Sales>, DatabaseError> FindByProductId(uint64_t productId);
    std::variant<std::vector<Sales>, DatabaseError> FindByBuyerId(uint64_t buyerId);
    std::variant<std::vector<Sales>, DatabaseError> FindByStatus(const std::string& status);
    std::variant<std::vector<Sales>, DatabaseError> FindByDateRange(const ::trantor::Date& start, const ::trantor::Date& end);
};

}