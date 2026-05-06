//
// Created by dmitry on 05.05.2026.
//

#ifndef CRYPTOPAYMENTSERVICE_TRANSACTIONSMAPPER_H
#define CRYPTOPAYMENTSERVICE_TRANSACTIONSMAPPER_H

#include <dto/requests/TransactionRequestTo.h>
#include <dto/responses/TransactionResponseTo.h>
#include "models/Transactions.h"

namespace soundwaveCryptoPayment
{
    using namespace drogon_model::soundwaveCryptoPayment;

    static Transactions toEntity(const TransactionRequestTo& dto)
    {
        Transactions entity;
        entity.setProductId(dto.productId);
        entity.setState("pending");
        entity.setAmount(dto.amount);
        entity.setTxhash(dto.txhash);
        entity.setUserId(dto.userId);
        return entity;
    }

    static TransactionResponseTo toResponse(const Transactions& entity)
    {
        TransactionResponseTo dto;
        dto.id = static_cast<std::int64_t>(entity.getValueOfId());
        dto.productId = static_cast<std::int64_t>(entity.getValueOfProductId());
        dto.state = entity.getValueOfState();
        dto.amount = entity.getValueOfAmount();
        if (!entity.getTxhash())
        {
            dto.txhash = "";
        }
        else
        {
            dto.txhash = entity.getValueOfTxhash();
        }
        dto.userId = static_cast<std::int64_t>(entity.getValueOfUserId());
        return dto;
    }

    static TransactionResponseTo toResponse(const TransactionRequestTo& reqDto, std::int64_t id)
    {
        TransactionResponseTo dto;
        dto.id = id;
        dto.productId = reqDto.productId;
        dto.state = "pending";
        dto.amount = reqDto.amount;
        dto.txhash = reqDto.txhash;
        dto.userId = reqDto.userId;
        dto.from = reqDto.from;
        dto.to = reqDto.to;
        return dto;
    }
}

#endif //CRYPTOPAYMENTSERVICE_TRANSACTIONSMAPPER_H
