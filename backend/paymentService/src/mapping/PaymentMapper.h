// PaymentMapper.h
#pragma once

#include <vector>
#include <cstdint>
#include <string>
#include <models/Payments.h>
#include <dto/responses/Responses.h>
#include <dto/requests/Requests.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;
using namespace dto;

class PaymentMapper
{
public:
    static Payments ToEntity(const PaymentRequestTo& dto)
    {
        Payments entity;
        entity.setUserId(dto.userId);
        entity.setAmount(dto.amount);
        entity.setCurrency(dto.currency);
        entity.setStatus(dto.status.empty() ? "pending" : dto.status);
        if (!dto.stripePaymentIntentId.empty())
        {
            entity.setStripePaymentIntentId(dto.stripePaymentIntentId);
        }
        return entity;
    }

    static PaymentResponseTo ToResponse(const Payments& entity)
    {
        PaymentResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.userId = entity.getValueOfUserId();
        dto.stripePaymentIntentId = entity.getValueOfStripePaymentIntentId();
        dto.stripePaymentMethodId = entity.getValueOfStripePaymentMethodId();
        dto.amount = entity.getValueOfAmount();
        dto.currency = entity.getValueOfCurrency();
        dto.status = entity.getValueOfStatus();
        dto.paymentType = entity.getValueOfPaymentType();
        dto.errorCode = entity.getValueOfErrorCode();
        dto.errorMessage = entity.getValueOfErrorMessage();
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        dto.updatedAt = entity.getValueOfUpdatedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<PaymentResponseTo> ToResponseList(const std::vector<Payments>& entities)
    {
        std::vector<PaymentResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}