//
// Created by divmone on 3/22/2026.
//

#include "logout.h"

#include <userver/components/component_context.hpp>

namespace shop::handlers {
    LogoutHandler::LogoutHandler(
            const userver::components::ComponentConfig &config,
            const userver::components::ComponentContext &context)
            :HttpHandlerBase(config, context)
            , user_repository_(context.FindComponent<shop::repositories::UserRepository>()){


    }

    std::string LogoutHandler::HandleRequestThrow(
        const userver::server::http::HttpRequest &request,
        userver::server::request::RequestContext &context) const {

        const auto auth = request.GetHeader("Authorization");
        if (auth.size() > 7) {
            const auto token = auth.substr(7);
            user_repository_.deleteSession(token);
        }

        request.GetHttpResponse().SetStatus(
               userver::server::http::HttpStatus::kOk
           );
        return "{}";
    }

}
