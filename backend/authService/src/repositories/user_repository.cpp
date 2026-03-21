//
// Created by divmone on 3/11/2026.
//

#include "user_repository.hpp"

#include <userver/components/component_context.hpp>
#include <userver/storages/postgres/component.hpp>

namespace shop::repositories {
    UserRepository::UserRepository(const userver::components::ComponentConfig &config,
            const userver::components::ComponentContext &context)
            : ComponentBase(config, context)
            , pg_cluster(context.FindComponent<userver::storages::postgres::ClusterPtr>("postgres-db-1"))
    {
    }

    User UserRepository::create(const std::string &google_id,
                                const std::string &email, const std::string &username,
                                const std::string &avatar_url) {

            const auto& result = pg_cluster->Execute(
             userver::storages::postgres::ClusterHostType::kMaster,
             "INSERT INTO users(google_id, email, username, avatar_url) "
             "VALUES($1, $2, $3, $4) "
             "RETURNING id, google_id, email, username, avatar_url"
             ,
             google_id, email, username, avatar_url
            );
    }

    std::optional<User> UserRepository::findByGoogleId(
        const std::string &) const {

        //TODO
    }
}
