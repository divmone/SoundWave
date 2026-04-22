//
// Created by divmone on 4/22/2026.
//

#ifndef DB_TEST_NOTIFYHANDLER_HPP
#define DB_TEST_NOTIFYHANDLER_HPP

#include <userver/server/handlers/http_handler_base.hpp>
#include "services/SendService.h"

namespace shop::handlers {
    using namespace userver;

    class NotifyHandler final : public server::handlers::HttpHandlerBase {
    public:
        constexpr static std::string_view kName = "handler-emails";

        NotifyHandler(const userver::components::ComponentConfig &config,
                    const userver::components::ComponentContext &context);

        std::string HandleRequestThrow(const server::http::HttpRequest &request,
                                       server::request::RequestContext &context)
        const override;

    private:
        services::SendService &sendService_;
    };
}

#endif //DB_TEST_NOTIFYHANDLER_HPP
