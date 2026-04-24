#include "PaymentMethodService.h"
#include <storage/database/PaymentMethodRepository.h>
#include <storage/database/StripeCustomerRepository.h>
#include <mapping/PaymentMethodMapper.h>
#include <exceptions/DatabaseException.h>

namespace soundwavePayment
{

using namespace dto;

PaymentMethodService::PaymentMethodService(
    std::shared_ptr<PaymentMethodRepository> paymentMethodRepository,
    std::shared_ptr<StripeCustomerRepository> stripeCustomerRepository)
    : m_paymentMethodRepo(paymentMethodRepository)
    , m_stripeCustomerRepo(stripeCustomerRepository)
{
}

PaymentMethodResponseTo PaymentMethodService::CreatePaymentMethod(const PaymentMethodResponseTo& request)
{
    PaymentMethodRequestTo req;
    req.userId = request.userId;
    req.stripeCustomerId = request.stripeCustomerId;
    req.stripePaymentMethodId = request.stripePaymentMethodId;
    req.isDefault = request.isDefault;
    req.cardBrand = request.cardBrand;
    req.cardLast4 = request.cardLast4;
    req.expMonth = request.expMonth;
    req.expYear = request.expYear;
    req.cardHolderName = request.cardHolderName;

    auto entity = PaymentMethodMapper::ToEntity(req);
    auto result = m_paymentMethodRepo->Create(entity);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to create payment method");
    }

    auto id = std::get<uint64_t>(result);
    auto getResult = m_paymentMethodRepo->GetByID(id);
    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve created payment method");
    }

    auto method = std::get<drogon_model::soundwavePayment::PaymentMethods>(getResult);
    return PaymentMethodMapper::ToResponse(method);
}

std::vector<PaymentMethodResponseTo> PaymentMethodService::GetUserPaymentMethods(int32_t userId)
{
    auto result = m_paymentMethodRepo->GetByUserId(userId);
    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve payment methods");
    }

    auto methods = std::get<std::vector<drogon_model::soundwavePayment::PaymentMethods>>(result);
    return PaymentMethodMapper::ToResponseList(methods);
}

bool PaymentMethodService::SetDefaultMethod(uint64_t id, int32_t userId)
{
    auto result = m_paymentMethodRepo->SetDefault(id, userId);
    if (std::holds_alternative<DatabaseError>(result))
    {
        return false;
    }
    return std::get<bool>(result);
}

bool PaymentMethodService::DeleteMethod(uint64_t id)
{
    auto result = m_paymentMethodRepo->Deactivate(id);
    if (std::holds_alternative<DatabaseError>(result))
    {
        return false;
    }
    return std::get<bool>(result);
}

}