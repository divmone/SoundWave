//
// Created by dmitry on 05.05.2026.
//

#ifndef SOUNDSSTORAGESERVICE_CUSTOMERWALLETSCONTROLLER_H
#define SOUNDSSTORAGESERVICE_CUSTOMERWALLETSCONTROLLER_H

#include <memory>
#include <drogon/HttpController.h>
#include <services/CustomerWalletsService.h>

namespace soundwaveCryptoPayment
{

using namespace drogon;

class CustomerWalletsController : public drogon::HttpController<CustomerWalletsController, false> {
private:

public:
    explicit CustomerWalletsController();
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(CustomerWalletsController::GetCustomerWallets,
                        "api/v1.0/customerWallets/{userId}", Get,
                        "soundwaveCryptoPayment::AuthCheckMiddleware");
    ADD_METHOD_TO(CustomerWalletsController::AddCustomerWallet,
                "api/v1.0/customerWallets/{userId}", Post,
                "soundwaveCryptoPayment::AuthCheckMiddleware");
    ADD_METHOD_TO(CustomerWalletsController::DeleteCustomerWallet,
                        "api/v1.0/customerWallets/{userId}", Delete,
                        "soundwaveCryptoPayment::AuthCheckMiddleware");
    METHOD_LIST_END
private:
    void GetCustomerWallets  (const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
    void AddCustomerWallet   (const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
    void DeleteCustomerWallet(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
};

}



#endif //SOUNDSSTORAGESERVICE_CUSTOMERWALLETSCONTROLLER_H

