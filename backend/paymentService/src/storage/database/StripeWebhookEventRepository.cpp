// StripeWebhookEventRepository.cpp
#include "StripeWebhookEventRepository.h"

namespace soundwavePayment
{

using namespace drogon::orm;

std::variant<uint64_t, DatabaseError> StripeWebhookEventRepository::Create(const StripeWebhookEvents& entity)
{
    try
    {
        auto id = Mapper().insertFuture(entity).get().getValueOfId();
        return static_cast<uint64_t>(id);
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<StripeWebhookEvents, DatabaseError> StripeWebhookEventRepository::GetByID(uint64_t id)
{
    try
    {
        return Mapper().findByPrimaryKey(id);
    }
    catch (const UnexpectedRows&)
    {
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> StripeWebhookEventRepository::Update(uint64_t id, const StripeWebhookEvents& entity)
{
    try
    {
        auto numUpdated = Mapper().update(entity);
        if (numUpdated) return true;
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> StripeWebhookEventRepository::Delete(uint64_t id)
{
    try
    {
        if (Mapper().deleteByPrimaryKey(id)) return true;
        return DatabaseError::NotFound;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> StripeWebhookEventRepository::Exists(uint64_t id)
{
    try
    {
        auto result = Mapper().findByPrimaryKey(id);
        return true;
    }
    catch (const UnexpectedRows&)
    {
        return false;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<std::vector<StripeWebhookEvents>, DatabaseError> StripeWebhookEventRepository::ReadAll()
{
    try
    {
        return Mapper().findAll();
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> StripeWebhookEventRepository::ExistsByEventId(const std::string& stripeEventId)
{
    try
    {
        auto results = Mapper().findBy(Criteria(StripeWebhookEvents::Cols::_stripe_event_id, CompareOperator::EQ, stripeEventId));
        return !results.empty();
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

std::variant<bool, DatabaseError> StripeWebhookEventRepository::MarkAsProcessed(const std::string& stripeEventId)
{
    try
    {
        auto results = Mapper().findBy(Criteria(StripeWebhookEvents::Cols::_stripe_event_id, CompareOperator::EQ, stripeEventId));
        if (results.empty())
        {
            return DatabaseError::NotFound;
        }
        auto event = results[0];
        event.setProcessed(true);
        auto numUpdated = Mapper().update(event);
        return numUpdated > 0;
    }
    catch(const std::exception& e)
    {
        LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
        return DatabaseError::DatabaseError;
    }
}

}