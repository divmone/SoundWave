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

#include "handlers/send/SendHandler.h"
#include "handlers/emails/NotifyHandler.hpp"
#include "services/SendService.h"

int main(int argc, char* argv[]) {
    auto component_list =
        userver::components::MinimalServerComponentList()
            .AppendComponentList(userver::clients::http::ComponentList())
            .Append<userver::congestion_control::Component>()
            .Append<userver::clients::dns::Component>("dns-client")
            .Append<userver::components::TestsuiteSupport>()
            .Append<shop::handlers::SendHandler>("handler-send")
            .Append<shop::handlers::NotifyHandler>("handler-emails")
            .Append<shop::services::SendService>("service-send")
        ;

    return userver::utils::DaemonMain(argc, argv, component_list);
}
