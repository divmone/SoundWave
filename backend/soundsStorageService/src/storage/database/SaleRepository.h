#pragma once

#include <vector>
#include <variant>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Sales.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class SaleRepository : public IDatabaseRepository<Sales, std::string, DatabaseError>
{
public:
    SaleRepository() = default;
    ~SaleRepository() = default;

    std::variant<std::string, DatabaseError> Create(const Sales& entity) override;
    std::variant<Sales, DatabaseError> GetByID(std::string id) override;
    std::variant<bool, DatabaseError> Update(std::string id, const Sales& entity) override;
    std::variant<bool, DatabaseError> Delete(std::string id) override;
    std::variant<std::vector<Sales>, DatabaseError> ReadAll() override;
    std::variant<bool, DatabaseError> Exists(std::string id) override;

    std::variant<std::vector<Sales>, DatabaseError> FindByProductId(const std::string& productId);
    std::variant<std::vector<Sales>, DatabaseError> FindByBuyerId(const std::string& buyerId);
    std::variant<std::vector<Sales>, DatabaseError> FindByStatus(const std::string& status);
    std::variant<std::vector<Sales>, DatabaseError> FindByDateRange(const ::trantor::Date& start, const ::trantor::Date& end);
};

}