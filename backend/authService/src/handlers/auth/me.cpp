//
// Created by divmone on 4/10/2026.
//

#include "me.hpp"

#include <userver/components/component_context.hpp>

namespace shop::handlers {
    MeHandler::MeHandler(
            const userver::components::ComponentConfig &config,
            const userver::components::ComponentContext &context)
            :HttpHandlerBase(config, context)
            , auth_service_(context.FindComponent<shop::services::AuthService>()){

    }

    std::string MeHandler::HandleRequestThrow(
        const userver::server::http::HttpRequest &request,
        userver::server::request::RequestContext &context) const {

        const auto token = request.GetHeader("Authorization").substr(7);

        const auto userId = auth_service_.getIdByToken(token);

        userver::formats::json::ValueBuilder resp;
        resp["id"] = userId;
        return userver::formats::json::ToString(resp.ExtractValue());
    }

}
