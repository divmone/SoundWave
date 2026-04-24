//
// Created by dmitry on 24.04.2026.
//

#include <exceptions/GlobalHandler.h>

using namespace soundwavePayment;

int main()
{
    drogon::app().loadConfigFile("config/app/config.json");

    /// БОЛЬШОЙ БАН БАН БАН
    drogon::app().setExceptionHandler(GlobalExceptionHandler);
    /// НЕ ДЕЛАТЬ ТАК БОЛЬШЕ В ЖИЗНИ


    drogon::app().run();

    return 0;
}