#include <userver/clients/dns/component.hpp>
#include <userver/clients/http/component_list.hpp>
#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/components/minimal_server_component_list.hpp>
#include <userver/congestion_control/component.hpp>
#include <userver/server/handlers/ping.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/testsuite/testsuite_support.hpp>
#include <userver/utils/daemon_run.hpp>

#include "handlers/AddSoundHandler.hpp"
#include "handlers/GenerateHandler.hpp"
#include "handlers/InfoHandler.hpp"
#include "handlers/StatusHandler.hpp"
#include "services/GenerateService.hpp"

int main(int argc, char* argv[]) {
    auto component_list =
        userver::components::MinimalServerComponentList()
            .AppendComponentList(userver::clients::http::ComponentList())
            .Append<userver::components::Postgres>("postgres-db-1")
            .Append<shop::services::GenerateService>("service-generate")
            .Append<GenerateHandler>("handler-generate")
            .Append<InfoHandler>("handler-info")
            .Append<AddSoundHandler>("handler-add-sound")
            .Append<StatusHandler>("handler-status")
        ;

    return userver::utils::DaemonMain(argc, argv, component_list);
}
