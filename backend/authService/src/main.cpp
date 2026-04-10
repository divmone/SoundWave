#include <userver/clients/dns/component.hpp>
#include <userver/clients/http/component_list.hpp>
#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/components/minimal_server_component_list.hpp>
#include <userver/congestion_control/component.hpp>
#include <userver/server/handlers/ping.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/testsuite/testsuite_support.hpp>

#include <userver/storages/postgres/component.hpp> 

#include <userver/utils/daemon_run.hpp>

#include "handlers/auth/google_auth.hpp"
#include "handlers/auth/logout.hpp"
#include "handlers/auth/me.hpp"
#include "handlers/users/users.hpp"
#include "services/auth_service.hpp"

int main(int argc, char* argv[]) {
    auto component_list =
        userver::components::MinimalServerComponentList()
            .AppendComponentList(userver::clients::http::ComponentList())
            .Append<userver::congestion_control::Component>()
            .Append<userver::clients::dns::Component>("dns-client")
            .Append<userver::components::TestsuiteSupport>()
            .Append<userver::components::Postgres>("postgres-db-1")
            .Append<shop::services::AuthService>("auth-service")
            .Append<shop::repositories::UserRepository>("user-repository")
            .Append<shop::handlers::GoogleAuthHandler>("handler-auth-google")
            .Append<shop::handlers::LogoutHandler>("handler-logout")
            .Append<shop::handlers::UserHandler>("handler-user")
            .Append<shop::handlers::MeHandler>("handler-me")
        ;

    return userver::utils::DaemonMain(argc, argv, component_list);
}
