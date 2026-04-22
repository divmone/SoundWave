//
// Created by divmone on 4/16/2026.
//

#ifndef DB_TEST_SENDHANDLER_H
#define DB_TEST_SENDHANDLER_H

#include <userver/server/handlers/http_handler_base.hpp>

#include "services/SendService.h"

namespace shop::handlers {
    using namespace userver;

    class SendHandler final : public server::handlers::HttpHandlerBase {
    public:
        constexpr static std::string_view kName = "handler-send";

        SendHandler(const userver::components::ComponentConfig &config,
                    const userver::components::ComponentContext &context);

        std::string HandleRequestThrow(const server::http::HttpRequest &request,
                                       server::request::RequestContext &context)
        const override;

    private:
        services::SendService &sendService_;
    };
}


#endif //DB_TEST_SENDHANDLER_H
