#include <userver/clients/dns/component.hpp>
#include <userver/clients/http/component_list.hpp>
#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/components/minimal_server_component_list.hpp>
#include <userver/congestion_control/component.hpp>
#include <userver/server/handlers/ping.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/testsuite/testsuite_support.hpp>

#include <userver/storages/mongo/component.hpp>    

#include <userver/utils/daemon_run.hpp>

#include "handlers/CommentGet.hpp"
#include "handlers/CommentPost.hpp"
#include "services/CommentService.hpp"

int main(int argc, char* argv[]) {
    auto component_list =
        userver::components::MinimalServerComponentList()
            .Append<userver::components::TestsuiteSupport>()
            .AppendComponentList(userver::clients::http::ComponentList())
            .Append<userver::clients::dns::Component>()
            .Append<userver::server::handlers::TestsControl>()
            .Append<userver::congestion_control::Component>()
            .Append<userver::components::Mongo>("mongo-db-1")
            .Append<shop::handlers::CommentPost>("handler-comment-post")
            .Append<shop::handlers::CommentGet>("handler-comment-get")
            .Append<shop::services::CommentService>("comment-service")
            .Append<shop::repositories::CommentRepository>("comment-repository")
        ;

    return userver::utils::DaemonMain(argc, argv, component_list);
}
