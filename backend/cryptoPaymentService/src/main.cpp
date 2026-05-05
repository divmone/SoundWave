//
// Created by dmitry on 05.05.2026.
//

#include <memory>
#include <drogon/drogon.h>
#include <api/v1.0/controllers/CustomerWalletsController.h>
#include <api/v1.0/controllers/TransactionsController.h>
#include <services/CustomerWalletsService.h>
#include <services/TransactionsService.h>
#include <storage/database/CustomerWalletsRepository.h>
#include <storage/database/TransactionsRepository.h>
#include <middleware/AuthCheckMiddleware.h>

using namespace soundwaveCryptoPayment;

int main()
{
    drogon::app().loadConfigFile("config/app/config.json");

    auto customerWalletsRepository = std::make_shared<CustomerWalletsRepository>();
    auto customerWalletsService = std::make_unique<CustomerWalletsService>(customerWalletsRepository);
    auto customerWalletsController = std::make_shared<CustomerWalletsController>(std::move(customerWalletsService));

    auto transactionsRepository = std::make_unique<TransactionsRepository>();
    auto transactionsService = std::make_unique<TransactionsService>(std::move(transactionsRepository));
    auto transactionsController = std::make_shared<TransactionsController>(std::move(transactionsService));

    drogon::app().registerController(customerWalletsController);
    drogon::app().registerController(transactionsController);
    drogon::app().run();
    return 0;
}
