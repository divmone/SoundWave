#include "PaymentService.h"
#include <storage/database/PaymentRepository.h>
#include <storage/database/PurchaseRepository.h>
#include <storage/database/PaymentMethodRepository.h>
#include <storage/database/StripeCustomerRepository.h>
#include <storage/database/PaymentIntentRepository.h>
#include <services/StripeClient.h>
#include <mapping/PaymentMapper.h>
#include <mapping/PurchaseMapper.h>
#include <mapping/PaymentMethodMapper.h>
#include <exceptions/DatabaseException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/PaymentException.h>

namespace soundwavePayment
{

using namespace dto;

PaymentService::PaymentService(
    std::shared_ptr<PaymentRepository> paymentRepository,
    std::shared_ptr<PurchaseRepository> purchaseRepository,
    std::shared_ptr<PaymentMethodRepository> paymentMethodRepository,
    std::shared_ptr<StripeCustomerRepository> stripeCustomerRepository,
    std::shared_ptr<PaymentIntentRepository> paymentIntentRepository)
    : m_paymentRepo(paymentRepository)
    , m_purchaseRepo(purchaseRepository)
    , m_paymentMethodRepo(paymentMethodRepository)
    , m_stripeCustomerRepo(stripeCustomerRepository)
    , m_paymentIntentRepo(paymentIntentRepository)
    , m_stripeClient(StripeClient::create())
{
}

PaymentResponseTo PaymentService::CreatePayment(int32_t userId, int64_t productId, const std::string& amount, const std::string& currency)
{
    int64_t amountCents = std::stoll(amount);
    
    auto stripeResult = m_stripeClient->CreatePaymentIntent(amountCents, currency, userId, productId);
    
    if (!stripeResult.success)
    {
        throw PaymentException(stripeResult.errorMessage.empty() ? "Failed to create Stripe PaymentIntent" : stripeResult.errorMessage);
    }
    
    drogon_model::soundwavePayment::PaymentIntents intent;
    intent.setUserId(userId);
    intent.setStripePaymentIntentId(stripeResult.id);
    intent.setStripeClientSecret(stripeResult.clientSecret);
    intent.setProductId(productId);
    intent.setAmount(amount);
    intent.setStatus("created");
    
    auto intentCreateResult = m_paymentIntentRepo->Create(intent);
    if (std::holds_alternative<DatabaseError>(intentCreateResult))
    {
        throw DatabaseException("Failed to create payment intent record");
    }
    
    PaymentRequestTo request;
    request.userId = userId;
    request.productId = productId;
    request.amount = amount;
    request.currency = currency;
    request.stripePaymentIntentId = stripeResult.id;
    request.status = stripeResult.status;
    
    auto entity = PaymentMapper::ToEntity(request);
    auto paymentResult = m_paymentRepo->Create(entity);
    
    if (std::holds_alternative<DatabaseError>(paymentResult))
    {
        throw DatabaseException("Failed to create payment record");
    }
    
    auto paymentId = std::get<uint64_t>(paymentResult);
    auto payment = std::get<drogon_model::soundwavePayment::Payments>(m_paymentRepo->GetByID(paymentId));
    auto response = PaymentMapper::ToResponse(payment);
    response.stripePaymentIntentId = stripeResult.id;
    response.clientSecret = stripeResult.clientSecret;
    
    return response;
}

PaymentResponseTo PaymentService::ConfirmPayment(const std::string& paymentIntentId)
{
    auto intentResult = m_paymentIntentRepo->GetByStripePaymentIntentId(paymentIntentId);
    if (std::holds_alternative<DatabaseError>(intentResult))
    {
        throw NotFoundException("Payment intent not found");
    }
    
    auto intent = std::get<drogon_model::soundwavePayment::PaymentIntents>(intentResult);
    
    auto stripeResult = m_stripeClient->ConfirmPaymentIntent(paymentIntentId);
    
    intent.setStatus(stripeResult.status);
    m_paymentIntentRepo->Update(intent.getValueOfId(), intent);
    
    PaymentRequestTo request;
    request.userId = intent.getValueOfUserId();
    request.productId = intent.getValueOfProductId();
    request.amount = intent.getValueOfAmount();
    request.currency = "USD";
    request.stripePaymentIntentId = paymentIntentId;
    request.status = stripeResult.success ? "succeeded" : "failed";
    
    auto entity = PaymentMapper::ToEntity(request);
    auto createResult = m_paymentRepo->Create(entity);
    
    if (std::holds_alternative<DatabaseError>(createResult))
    {
        throw DatabaseException("Failed to create payment");
    }
    
    auto paymentId = std::get<uint64_t>(createResult);
    auto payment = std::get<drogon_model::soundwavePayment::Payments>(m_paymentRepo->GetByID(paymentId));
    auto response = PaymentMapper::ToResponse(payment);
    response.status = stripeResult.success ? "succeeded" : "failed";
    
    if (stripeResult.success)
    {
        try
        {
            CreatePurchase(paymentId, intent.getValueOfUserId(), intent.getValueOfProductId(), 
                          intent.getValueOfAmount(), "");
        }
        catch (const std::exception&)
        {
        }
    }
    
    return response;
}

PaymentResponseTo PaymentService::GetPayment(uint64_t id)
{
    auto result = m_paymentRepo->GetByID(id);
    if (std::holds_alternative<DatabaseError>(result))
    {
        throw NotFoundException("Payment not found");
    }

    PaymentResponseTo response;
    response.id = std::get<drogon_model::soundwavePayment::Payments>(result).getValueOfId();
    return response;
}

std::vector<PaymentResponseTo> PaymentService::GetUserPayments(int32_t userId)
{
    auto result = m_paymentRepo->GetByUserId(userId);
    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve payments");
    }

    std::vector<PaymentResponseTo> payments;
    for (const auto& payment : std::get<std::vector<drogon_model::soundwavePayment::Payments>>(result))
    {
        PaymentResponseTo response;
        response.id = payment.getValueOfId();
        response.userId = payment.getValueOfUserId();
        response.status = payment.getValueOfStatus();
        response.amount = payment.getValueOfAmount();
        response.currency = payment.getValueOfCurrency();
        response.createdAt = payment.getValueOfCreatedAt().toFormattedString(false);
        payments.push_back(response);
    }

    return payments;
}

bool PaymentService::CancelPayment(uint64_t id)
{
    auto getResult = m_paymentRepo->GetByID(id);
    if (std::holds_alternative<DatabaseError>(getResult))
    {
        return false;
    }
    auto payment = std::get<drogon_model::soundwavePayment::Payments>(getResult);
    payment.setStatus("cancelled");
    auto result = m_paymentRepo->Update(id, payment);
    if (std::holds_alternative<DatabaseError>(result))
    {
        return false;
    }
    return std::get<bool>(result);
}

PurchaseResponseTo PaymentService::CreatePurchase(uint64_t paymentId, int32_t userId, int64_t productId, const std::string& pricePaid, const std::string& productTitle)
{
    auto checkResult = m_purchaseRepo->CheckUserHasPurchased(userId, productId);
    if (std::holds_alternative<bool>(checkResult) && std::get<bool>(checkResult))
    {
        throw PaymentException("User already owns this product");
    }

    drogon_model::soundwavePayment::Purchases purchase;
    purchase.setUserId(userId);
    purchase.setProductId(productId);
    purchase.setPaymentId(paymentId);
    purchase.setPricePaid(pricePaid);
    purchase.setProductTitle(productTitle);
    purchase.setIsActive(true);

    auto createResult = m_purchaseRepo->Create(purchase);
    if (std::holds_alternative<DatabaseError>(createResult))
    {
        throw DatabaseException("Failed to create purchase");
    }

    PurchaseResponseTo response;
    response.id = std::get<uint64_t>(createResult);
    response.userId = userId;
    response.productId = productId;
    response.pricePaid = pricePaid;
    response.productTitle = productTitle;
    response.isActive = true;
    response.createdAt = trantor::Date::now().toFormattedString(false);

    return response;
}

PurchaseResponseTo PaymentService::GetPurchase(uint64_t id)
{
    auto result = m_purchaseRepo->GetByID(id);
    if (std::holds_alternative<DatabaseError>(result))
    {
        throw NotFoundException("Purchase not found");
    }

    PurchaseResponseTo response;
    response.id = std::get<drogon_model::soundwavePayment::Purchases>(result).getValueOfId();
    return response;
}

std::vector<PurchaseResponseTo> PaymentService::GetUserPurchases(int32_t userId)
{
    auto result = m_purchaseRepo->GetByUserId(userId);
    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve purchases");
    }

    std::vector<PurchaseResponseTo> purchases;
    for (const auto& purchase : std::get<std::vector<drogon_model::soundwavePayment::Purchases>>(result))
    {
        PurchaseResponseTo response;
        response.id = purchase.getValueOfId();
        response.userId = purchase.getValueOfUserId();
        response.productId = purchase.getValueOfProductId();
        response.pricePaid = purchase.getValueOfPricePaid();
        response.productTitle = purchase.getValueOfProductTitle();
        response.isActive = purchase.getValueOfIsActive();
        response.createdAt = purchase.getValueOfCreatedAt().toFormattedString(false);
        purchases.push_back(response);
    }

    return purchases;
}

bool PaymentService::CheckUserHasAccess(int32_t userId, int64_t productId)
{
    auto result = m_purchaseRepo->CheckUserHasPurchased(userId, productId);
    if (std::holds_alternative<bool>(result))
    {
        return std::get<bool>(result);
    }
    return false;
}

bool PaymentService::RefundPurchase(uint64_t id, const std::string& reason)
{
    auto refundResult = m_purchaseRepo->MarkAsRefunded(id, reason);
    if (std::holds_alternative<DatabaseError>(refundResult))
    {
        return false;
    }

    auto purchaseResult = m_purchaseRepo->GetByID(id);
    if (std::holds_alternative<drogon_model::soundwavePayment::Purchases>(purchaseResult))
    {
        auto purchase = std::get<drogon_model::soundwavePayment::Purchases>(purchaseResult);
        auto paymentGetResult = m_paymentRepo->GetByID(purchase.getValueOfPaymentId());
        if (std::holds_alternative<drogon_model::soundwavePayment::Payments>(paymentGetResult))
        {
            auto payment = std::get<drogon_model::soundwavePayment::Payments>(paymentGetResult);
            auto stripePI = payment.getValueOfStripePaymentIntentId();
            if (!stripePI.empty())
            {
                auto refund = m_stripeClient->CreateRefund(stripePI, reason);
            }
            payment.setStatus("refunded");
            m_paymentRepo->Update(purchase.getValueOfPaymentId(), payment);
        }
    }

    return std::get<bool>(refundResult);
}

std::string PaymentService::GetPaymentIntentClientSecret(int32_t userId, int64_t productId)
{
    auto intentResult = m_paymentIntentRepo->GetByUserIdAndProductId(userId, productId);
    if (std::holds_alternative<DatabaseError>(intentResult))
    {
        return "";
    }

    auto intent = std::get<drogon_model::soundwavePayment::PaymentIntents>(intentResult);
    return intent.getValueOfStripeClientSecret();
}

PaymentResponseTo PaymentService::enrichWithPaymentMethod(const PaymentResponseTo& payment)
{
    return payment;
}

PurchaseResponseTo PaymentService::enrichWithPayment(const PurchaseResponseTo& purchase)
{
    return purchase;
}

}