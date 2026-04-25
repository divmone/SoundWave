// PaymentIntentMapper.h
#pragma once

#include <vector>
#include <cstdint>
#include <string>
#include <models/PaymentIntents.h>
#include <dto/responses/Responses.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;
using namespace dto;

class PaymentIntentMapper
{
public:
    static PaymentIntentResponseTo ToResponse(const PaymentIntents& entity)
    {
        PaymentIntentResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.userId = entity.getValueOfUserId();
        dto.productId = entity.getValueOfProductId();
        dto.stripePaymentIntentId = entity.getValueOfStripePaymentIntentId();
        dto.clientSecret = entity.getValueOfStripeClientSecret();
        dto.amount = entity.getValueOfAmount();
        dto.status = entity.getValueOfStatus();
        dto.expiresAt = entity.getExpiresAt() ? entity.getExpiresAt()->toFormattedString(false) : "";
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<PaymentIntentResponseTo> ToResponseList(const std::vector<PaymentIntents>& entities)
    {
        std::vector<PaymentIntentResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}