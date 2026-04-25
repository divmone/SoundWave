// PaymentMethodMapper.h
#pragma once

#include <vector>
#include <cstdint>
#include <string>
#include <models/PaymentMethods.h>
#include <dto/responses/Responses.h>
#include <dto/requests/Requests.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;
using namespace dto;

class PaymentMethodMapper
{
public:
    static PaymentMethods ToEntity(const PaymentMethodRequestTo& dto)
    {
        PaymentMethods entity;
        entity.setUserId(dto.userId);
        entity.setStripeCustomerId(dto.stripeCustomerId);
        entity.setStripePaymentMethodId(dto.stripePaymentMethodId);
        entity.setIsDefault(dto.isDefault);
        entity.setCardBrand(dto.cardBrand);
        entity.setCardLast4(dto.cardLast4);
        entity.setCardExpMonth(dto.expMonth);
        entity.setCardExpYear(dto.expYear);
        entity.setCardHolderName(dto.cardHolderName);
        entity.setIsActive(true);
        return entity;
    }

    static PaymentMethodResponseTo ToResponse(const PaymentMethods& entity)
    {
        PaymentMethodResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.userId = entity.getValueOfUserId();
        dto.stripeCustomerId = entity.getValueOfStripeCustomerId();
        dto.stripePaymentMethodId = entity.getValueOfStripePaymentMethodId();
        dto.isDefault = entity.getValueOfIsDefault();
        dto.cardBrand = entity.getValueOfCardBrand();
        dto.cardLast4 = entity.getValueOfCardLast4();
        dto.expMonth = entity.getValueOfCardExpMonth();
        dto.expYear = entity.getValueOfCardExpYear();
        dto.cardHolderName = entity.getValueOfCardHolderName();
        dto.isActive = entity.getValueOfIsActive();
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        dto.updatedAt = entity.getValueOfUpdatedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<PaymentMethodResponseTo> ToResponseList(const std::vector<PaymentMethods>& entities)
    {
        std::vector<PaymentMethodResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}