// PaymentIntentRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/PaymentIntents.h>
#include <exceptions/DatabaseError.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;

class PaymentIntentRepository : public IDatabaseRepository<PaymentIntents, uint64_t, DatabaseError>
{
public:
    PaymentIntentRepository() = default;
    ~PaymentIntentRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const PaymentIntents& entity) override;
    std::variant<PaymentIntents, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const PaymentIntents& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<std::vector<PaymentIntents>, DatabaseError> ReadAll() override;

    std::variant<std::vector<PaymentIntents>, DatabaseError> GetByUserId(int32_t userId);
    std::variant<PaymentIntents, DatabaseError> GetByStripePaymentIntentId(const std::string& stripePaymentIntentId);
    std::variant<PaymentIntents, DatabaseError> GetByUserIdAndProductId(int32_t userId, int64_t productId);
    std::variant<bool, DatabaseError> ExpireOldIntents(int32_t userId, int64_t productId);
};

}