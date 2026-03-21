//
// Created by divmone on 3/11/2026.
//

#pragma once

#include <userver/components/component_base.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include "models/user.hpp"

namespace shop::repositories {
    class UserRepository final :public userver::components::ComponentBase  {
    public:
        static constexpr std::string_view kName = "user-repository";

        UserRepository(
            const userver::components::ComponentConfig &config,
            const userver::components::ComponentContext &context
        );

        User create(
            const std::string &google_id,
            const std::string &email,
            const std::string &username,
            const std::string &avatar_url);

        std::optional<User> findByGoogleId(const std::string &) const;

    private:
        userver::storages::postgres::ClusterPtr pg_cluster;
    };
}
