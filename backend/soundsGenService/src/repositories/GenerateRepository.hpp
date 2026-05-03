//
// Created by divmone on 3/11/2026.
//

#pragma once

#include <userver/components/component_base.hpp>
#include <userver/storages/postgres/cluster.hpp>

namespace shop::repositories {
    class GenerateRepository final :public userver::components::ComponentBase  {
    public:
        static constexpr std::string_view kName = "repository-generate";

        GenerateRepository(
            const userver::components::ComponentConfig &config,
            const userver::components::ComponentContext &context
        );

        void addSoundInfo(const std::string&);
    private:
        userver::storages::postgres::ClusterPtr pg_cluster;
    };
}
