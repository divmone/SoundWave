//
// Created by dmitry on 05.05.2026.
//

#ifndef CRYPTOPAYMENTSERVICE_CUSTOMERWALLETSMAPPER_H
#define CRYPTOPAYMENTSERVICE_CUSTOMERWALLETSMAPPER_H
#include <dto/requests/CustomerWalletRequestTo.h>
#include <dto/responses/CustomerWalletResponseTo.h>
#include "models/CustomerWallets.h"

namespace soundwaveCryptoPayment
{
    using namespace  drogon_model::soundwaveCryptoPayment;

    static CustomerWallets toEntity(const CustomerWalletRequestTo& dto)
    {
        CustomerWallets entity;
        entity.setIserId(static_cast<int64_t>(dto.userId));
        entity.setWallet(dto.wallet);
        return entity;
    }

    static CustomerWalletResponseTo toResponse(const CustomerWallets& entity)
    {
        CustomerWalletResponseTo dto;
        dto.userId = static_cast<std::uint64_t>(entity.getValueOfIserId());
        dto.wallet = entity.getValueOfWallet();
        return dto;
    }
}

#endif //CRYPTOPAYMENTSERVICE_CUSTOMERWALLETSMAPPER_H
