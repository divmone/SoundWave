//
// Created by dmitry on 05.05.2026.
//

#include <memory>
#include <drogon/drogon.h>
#include <api/v1.0/controllers/CustomerWalletsController.h>
#include <services/CustomerWalletsService.h>
#include <storage/database/CustomerWalletsRepository.h>
#include <middleware/AuthCheckMiddleware.h>

using namespace soundwaveCryptoPayment;

int main()
{
    drogon::app().loadConfigFile("config/app/config.json");

    auto customerWalletsRepository = std::make_shared<CustomerWalletsRepository>();
    auto customerWalletsService = std::make_unique<CustomerWalletsService>(customerWalletsRepository);
    auto customerWalletsController = std::make_shared<CustomerWalletsController>(std::move(customerWalletsService));

    drogon::app().registerController(customerWalletsController);
    drogon::app().run();
    return 0;
}
