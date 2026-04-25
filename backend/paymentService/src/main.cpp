#include <drogon/HttpAppFramework.h>
#include <cstdlib>

#include <storage/database/PaymentRepository.h>
#include <storage/database/PurchaseRepository.h>
#include <storage/database/PaymentMethodRepository.h>
#include <storage/database/StripeCustomerRepository.h>
#include <storage/database/PaymentIntentRepository.h>

#include <services/PaymentService.h>
#include <services/PaymentMethodService.h>

#include <api/v1.0/controllers/PaymentsController.h>
#include <api/v1.0/controllers/PurchasesController.h>
#include <api/v1.0/controllers/PaymentMethodsController.h>
#include <api/v1.0/controllers/WebhookController.h>

#include <exceptions/GlobalHandler.h>

#include "middleware/AuthCheckMiddleware.h"

using namespace soundwavePayment;

int main()
{
    drogon::app().loadConfigFile("config/app/config.json");

    drogon::app().setExceptionHandler(GlobalExceptionHandler);

    auto paymentRepo = std::make_shared<PaymentRepository>();
    auto purchaseRepo = std::make_shared<PurchaseRepository>();
    auto paymentMethodRepo = std::make_shared<PaymentMethodRepository>();
    auto stripeCustomerRepo = std::make_shared<StripeCustomerRepository>();
    auto paymentIntentRepo = std::make_shared<PaymentIntentRepository>();

    auto paymentService = std::make_shared<PaymentService>(
        paymentRepo,
        purchaseRepo,
        paymentMethodRepo,
        stripeCustomerRepo,
        paymentIntentRepo
    );

    auto paymentMethodService = std::make_shared<PaymentMethodService>(
        paymentMethodRepo,
        stripeCustomerRepo
    );

    auto paymentsController = std::make_shared<PaymentsController>(paymentService);
    auto purchasesController = std::make_shared<PurchasesController>(paymentService);
    auto paymentMethodsController = std::make_shared<PaymentMethodsController>(paymentMethodService);
    auto webhookController = std::make_shared<WebhookController>();

    drogon::app().registerController(paymentsController);
    drogon::app().registerController(purchasesController);
    drogon::app().registerController(paymentMethodsController);
    drogon::app().registerController(webhookController);
    drogon::app().run();

    return 0;
}