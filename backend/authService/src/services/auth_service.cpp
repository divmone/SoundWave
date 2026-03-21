//
// Created by divmone on 3/11/2026.
//

#include "auth_service.hpp"

#include <userver/components/component_context.hpp>
#include <userver/utils/exception.hpp>

namespace shop::services {
    AuthService::AuthService(const userver::components::ComponentConfig& config,
           const userver::components::ComponentContext& context)
               : ComponentBase(config, context)
                , user_repository_(context.FindComponent<repositories::UserRepository>("user-repository"))
                , client_(context.FindComponent<userver::clients::http::Client>("http-client")){

    }


    User AuthService::loginWithGoogle(const std::string &google_id) {
        const auto res = client_.CreateRequest()
        .get("https://oauth2.googleapis.com/tokeninfo?id_token=" + google_id)
        .retry(2)
        .perform();

        if (res->status_code() != 200) {
            throw std::runtime_error("invalid google token");
        }

        const auto json = userver::formats::json::FromString(res->body());
        const auto google_token = json["sub"].As<std::string>();
        const auto email = json["email"].As<std::string>();
        const auto name = json["name"].As<std::string>();

        const auto user = user_repository_.findByGoogleId(google_token);
        if (!user) {
            user_repository_.create(google_token, email, name, "");
        }

        return *user;
    }
}
