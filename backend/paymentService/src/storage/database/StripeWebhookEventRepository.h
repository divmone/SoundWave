#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <string>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/StripeWebhookEvents.h>
#include <exceptions/DatabaseError.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;

class StripeWebhookEventRepository : public IDatabaseRepository<StripeWebhookEvents, uint64_t, DatabaseError>
{
public:
    StripeWebhookEventRepository() = default;
    ~StripeWebhookEventRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const StripeWebhookEvents& entity) override;
    std::variant<StripeWebhookEvents, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const StripeWebhookEvents& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;
    std::variant<std::vector<StripeWebhookEvents>, DatabaseError> ReadAll() override;

    std::variant<bool, DatabaseError> ExistsByEventId(const std::string& stripeEventId);
    std::variant<bool, DatabaseError> MarkAsProcessed(const std::string& stripeEventId);
};

}