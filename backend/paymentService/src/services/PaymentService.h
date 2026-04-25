#pragma once

#include <memory>
#include <string>
#include <cstdint>
#include <dto/responses/Responses.h>

namespace soundwavePayment
{

class PaymentRepository;
class PurchaseRepository;
class PaymentMethodRepository;
class StripeCustomerRepository;
class PaymentIntentRepository;

class PaymentService
{
public:
    explicit PaymentService(
        std::shared_ptr<PaymentRepository> paymentRepository,
        std::shared_ptr<PurchaseRepository> purchaseRepository,
        std::shared_ptr<PaymentMethodRepository> paymentMethodRepository,
        std::shared_ptr<StripeCustomerRepository> stripeCustomerRepository,
        std::shared_ptr<PaymentIntentRepository> paymentIntentRepository);

    dto::PaymentResponseTo CreatePayment(int32_t userId, int64_t productId, const std::string& amount, const std::string& currency);
    dto::PaymentResponseTo ConfirmPayment(const std::string& paymentIntentId);
    dto::PaymentResponseTo GetPayment(uint64_t id);
    std::vector<dto::PaymentResponseTo> GetUserPayments(int32_t userId);
    bool CancelPayment(uint64_t id);

    dto::PurchaseResponseTo CreatePurchase(uint64_t paymentId, int32_t userId, int64_t productId, const std::string& pricePaid, const std::string& productTitle);
    dto::PurchaseResponseTo GetPurchase(uint64_t id);
    std::vector<dto::PurchaseResponseTo> GetUserPurchases(int32_t userId);
    bool CheckUserHasAccess(int32_t userId, int64_t productId);
    bool RefundPurchase(uint64_t id, const std::string& reason);
    std::string GetPaymentIntentClientSecret(int32_t userId, int64_t productId);

private:
    dto::PaymentResponseTo enrichWithPaymentMethod(const dto::PaymentResponseTo& payment);
    dto::PurchaseResponseTo enrichWithPayment(const dto::PurchaseResponseTo& purchase);

    std::shared_ptr<PaymentRepository> m_paymentRepo;
    std::shared_ptr<PurchaseRepository> m_purchaseRepo;
    std::shared_ptr<PaymentMethodRepository> m_paymentMethodRepo;
    std::shared_ptr<StripeCustomerRepository> m_stripeCustomerRepo;
    std::shared_ptr<PaymentIntentRepository> m_paymentIntentRepo;
};

}