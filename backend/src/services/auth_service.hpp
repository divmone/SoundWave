//
// Created by divmone on 3/11/2026.
//

#pragma once

#include <userver/clients/http/client.hpp>
#include "models/user.hpp"
#include "repositories/user_repository.hpp"

namespace shop::services {
    class AuthService final: public userver::components::ComponentBase{
    public:
        static constexpr std::string_view kName = "auth_service";

        explicit AuthService(const userver::components::ComponentConfig& config,
            const userver::components::ComponentContext& context);

        User loginWithGoogle(const std::string&);

    private:
        repositories::UserRepository& user_repository_;
        userver::clients::http::Client& client_;
    };
}
