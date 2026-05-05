//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_CUSTOMERWALLETSREPODITORY_H
#define SOUNDSSTORAGESERVICE_CUSTOMERWALLETSREPODITORY_H

#include <string>
#include <vector>
#include <drogon/drogon.h>
#include <models/CustomerWallets.h>
#include "IDatabaseRepository.h"
#include "dto/requests/CustomerWalletRequestTo.h"
#include "dto/responses/CustomerWalletResponseTo.h"

namespace  soundwaveCryptoPayment
{

using namespace drogon;
using namespace drogon_model::soundwaveCryptoPayment;


class CustomerWalletsRepository: public IDatabaseRepository<CustomerWallets, uint64_t, DatabaseError> {
public:
    CustomerWalletsRepository() = default;
    ~CustomerWalletsRepository() = default;
    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError> AddWallet(CustomerWalletRequestTo dto);
    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError> GetWallets(uint64_t userId);
    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError> DeleteWallet(CustomerWalletRequestTo dto);
};

}



#endif //SOUNDSSTORAGESERVICE_CUSTOMERWALLETSREPODITORY_H
