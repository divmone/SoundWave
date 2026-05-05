//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_CUSTOMERWALLETSSERVICE_H
#define SOUNDSSTORAGESERVICE_CUSTOMERWALLETSSERVICE_H

#include <vector>
#include <variant>
#include <string>
#include <storage/database/CustomerWalletsRepository.h>
#include <dto/requests/CustomerWalletRequestTo.h>
#include <dto/responses/CustomerWalletResponseTo.h>
#include <exceptions/DatabaseError.h>
#include <exceptions/ValidationException.h>
#include <exceptions/NotFoundException.h>

namespace soundwaveCryptoPayment
{

class CustomerWalletsService
{
public:
    CustomerWalletsService();

    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError> GetWallets(uint64_t userId);
    std::variant<CustomerWalletResponseTo, DatabaseError> AddWallet(uint64_t userId, const std::string& wallet);
    std::variant<bool, DatabaseError> DeleteWallet(uint64_t userId, const std::string& wallet);

private:
    CustomerWalletsRepository m_repository;

    void ValidateWallet(const std::string& wallet);
};

}

#endif //SOUNDSSTORAGESERVICE_CUSTOMERWALLETSSERVICE_H
