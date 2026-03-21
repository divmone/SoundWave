//
// Created by divmone on 3/11/2026.
//

#include "google_auth.hpp"

#include <userver/components/component_context.hpp>

namespace shop::handlers {
    GoogleAuthHandler::GoogleAuthHandler(
        const userver::components::ComponentConfig &config,
        const userver::components::ComponentContext &context) : HttpHandlerBase(
        config, context), auth_service_(context.FindComponent<shop::services::AuthService>()) {
    }

    std::string GoogleAuthHandler::HandleRequestThrow(
        const userver::server::http::HttpRequest &request,
        userver::server::request::RequestContext &context) const {

        const auto& token = request.GetArg("google_token");

        const auto& response = auth_service_.loginWithGoogle(token);

        userver::formats::json::ValueBuilder resp;
        resp["id"]       = response.id;
        resp["email"]    = response.email;
        resp["username"] = response.username;
        return userver::formats::json::ToString(resp.ExtractValue());
    }
}
