// PurchaseMapper.h
#pragma once

#include <vector>
#include <cstdint>
#include <string>
#include <models/Purchases.h>
#include <dto/responses/Responses.h>
#include <dto/requests/Requests.h>

namespace soundwavePayment
{

using namespace drogon_model::soundwavePayment;
using namespace dto;

class PurchaseMapper
{
public:
    static Purchases ToEntity(const PurchaseRequestTo& dto)
    {
        Purchases entity;
        entity.setUserId(dto.userId);
        entity.setProductId(dto.productId);
        entity.setPaymentId(dto.paymentId);
        entity.setPricePaid(dto.pricePaid);
        entity.setProductTitle(dto.productTitle);
        entity.setIsActive(true);
        return entity;
    }

    static PurchaseResponseTo ToResponse(const Purchases& entity)
    {
        PurchaseResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.userId = entity.getValueOfUserId();
        dto.productId = entity.getValueOfProductId();
        dto.paymentId = entity.getValueOfPaymentId();
        dto.pricePaid = entity.getValueOfPricePaid();
        dto.productTitle = entity.getValueOfProductTitle();
        dto.isActive = entity.getValueOfIsActive();
        dto.refundedAt = entity.getRefundedAt() ? entity.getRefundedAt()->toFormattedString(false) : "";
        dto.refundReason = entity.getValueOfRefundReason();
        dto.createdAt = entity.getValueOfCreatedAt().toFormattedString(false);
        dto.updatedAt = entity.getValueOfUpdatedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<PurchaseResponseTo> ToResponseList(const std::vector<Purchases>& entities)
    {
        std::vector<PurchaseResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}