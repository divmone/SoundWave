// PurchaseRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Purchases.h>
#include <exceptions/DatabaseError.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;

class PurchaseRepository : public IDatabaseRepository<Purchases, uint64_t, DatabaseError>
{
public:
    PurchaseRepository() = default;
    ~PurchaseRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const Purchases& entity) override;
    std::variant<Purchases, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const Purchases& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<std::vector<Purchases>, DatabaseError> ReadAll() override;

    std::variant<std::vector<Purchases>, DatabaseError> GetByUserId(int32_t userId);
    std::variant<std::vector<Purchases>, DatabaseError> GetByProductId(int64_t productId);
    std::variant<bool, DatabaseError> CheckUserHasPurchased(int32_t userId, int64_t productId);
    std::variant<Purchases, DatabaseError> GetUserPurchase(int32_t userId, int64_t productId);
    std::variant<bool, DatabaseError> UpdateStatus(uint64_t id, bool isActive);
    std::variant<bool, DatabaseError> MarkAsRefunded(uint64_t id, const std::string& reason);
};

}