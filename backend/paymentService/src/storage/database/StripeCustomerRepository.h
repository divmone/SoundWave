// StripeCustomerRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/StripeCustomers.h>
#include <exceptions/DatabaseError.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;

class StripeCustomerRepository : public IDatabaseRepository<StripeCustomers, uint64_t, DatabaseError>
{
public:
    StripeCustomerRepository() = default;
    ~StripeCustomerRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const StripeCustomers& entity) override;
    std::variant<StripeCustomers, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const StripeCustomers& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<std::vector<StripeCustomers>, DatabaseError> ReadAll() override;

    std::variant<StripeCustomers, DatabaseError> GetByUserId(int32_t userId);
    std::variant<StripeCustomers, DatabaseError> GetByStripeCustomerId(const std::string& stripeCustomerId);
    std::variant<bool, DatabaseError> ExistsByUserId(int32_t userId);
};

}