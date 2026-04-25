#pragma once

#include <memory>
#include <string>
#include <cstdint>
#include <dto/responses/Responses.h>

namespace soundwavePayment
{

class PaymentMethodRepository;
class StripeCustomerRepository;

class PaymentMethodService
{
public:
    explicit PaymentMethodService(
        std::shared_ptr<PaymentMethodRepository> paymentMethodRepository,
        std::shared_ptr<StripeCustomerRepository> stripeCustomerRepository);

    dto::PaymentMethodResponseTo CreatePaymentMethod(const dto::PaymentMethodResponseTo& request);
    std::vector<dto::PaymentMethodResponseTo> GetUserPaymentMethods(int32_t userId);
    bool SetDefaultMethod(uint64_t id, int32_t userId);
    bool DeleteMethod(uint64_t id);

private:
    std::shared_ptr<PaymentMethodRepository> m_paymentMethodRepo;
    std::shared_ptr<StripeCustomerRepository> m_stripeCustomerRepo;
};

}