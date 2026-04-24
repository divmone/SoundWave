// PaymentMethodRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/PaymentMethods.h>
#include <exceptions/DatabaseError.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;

class PaymentMethodRepository : public IDatabaseRepository<PaymentMethods, uint64_t, DatabaseError>
{
public:
    PaymentMethodRepository() = default;
    ~PaymentMethodRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const PaymentMethods& entity) override;
    std::variant<PaymentMethods, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const PaymentMethods& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<std::vector<PaymentMethods>, DatabaseError> ReadAll() override;

    std::variant<std::vector<PaymentMethods>, DatabaseError> GetByUserId(int32_t userId);
    std::variant<PaymentMethods, DatabaseError> GetDefaultByUserId(int32_t userId);
    std::variant<bool, DatabaseError> SetDefault(uint64_t id, int32_t userId);
    std::variant<bool, DatabaseError> Deactivate(uint64_t id);
};

}