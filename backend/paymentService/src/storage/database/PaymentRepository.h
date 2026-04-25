// PaymentRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Payments.h>
#include <exceptions/DatabaseError.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;

class PaymentRepository : public IDatabaseRepository<Payments, uint64_t, DatabaseError>
{
public:
    PaymentRepository() = default;
    ~PaymentRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const Payments& entity) override;
    std::variant<Payments, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const Payments& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<std::vector<Payments>, DatabaseError> ReadAll() override;

    std::variant<std::vector<Payments>, DatabaseError> GetByUserId(int32_t userId);
    std::variant<std::vector<Payments>, DatabaseError> GetByStripePaymentIntentId(const std::string& stripePaymentIntentId);
};

}