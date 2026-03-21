#pragma once

#include <vector>
#include <models/Sales.h>
#include <dto/requests/SaleRequestTo.h>
#include <dto/responses/SaleResponseTo.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;
using namespace dto;

class SaleMapper
{
public:
    static Sales ToEntity(const SaleRequestTo& dto)
    {
        Sales entity;
        if (dto.id.has_value())
        {
            entity.setId(dto.id.value());
        }
        entity.setProductId(dto.productId);
        entity.setBuyerId(dto.buyerId);
        entity.setAmount(dto.amount);
        entity.setPaymentMethod(dto.paymentMethod);
        if (dto.status.has_value())
        {
            entity.setStatus(dto.status.value());
        }
        return entity;
    }

    static Sales ToEntityForUpdate(const SaleRequestTo& dto, const std::string& id)
    {
        Sales entity;
        entity.setId(id);
        entity.setProductId(dto.productId);
        entity.setBuyerId(dto.buyerId);
        entity.setAmount(dto.amount);
        entity.setPaymentMethod(dto.paymentMethod);
        if (dto.status.has_value())
        {
            entity.setStatus(dto.status.value());
        }
        return entity;
    }

    static SaleResponseTo ToResponse(const Sales& entity)
    {
        SaleResponseTo dto;
        dto.id = entity.getValueOfId();
        dto.productId = entity.getValueOfProductId();
        dto.buyerId = entity.getValueOfBuyerId();
        dto.amount = entity.getValueOfAmount();
        dto.paymentMethod = entity.getValueOfPaymentMethod();
        dto.status = entity.getValueOfStatus();
        dto.purchasedAt = entity.getValueOfPurchasedAt().toFormattedString(false);
        return dto;
    }

    static std::vector<SaleResponseTo> ToResponseList(const std::vector<Sales>& entities)
    {
        std::vector<SaleResponseTo> dtos;
        dtos.reserve(entities.size());
        for (const auto& entity : entities)
        {
            dtos.push_back(ToResponse(entity));
        }
        return dtos;
    }
};

}