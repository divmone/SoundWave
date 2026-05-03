//
// Created by divmone on 3/11/2026.
//

#include "GenerateRepository.hpp"

#include <userver/components/component_context.hpp>
#include <userver/storages/postgres/component.hpp>

namespace shop::repositories {
    GenerateRepository::GenerateRepository(
        const userver::components::ComponentConfig &config,
        const userver::components::ComponentContext &context)
        : ComponentBase(config, context),
          pg_cluster(
              context.FindComponent<userver::components::Postgres>(
                  "postgres-db-1")
              .GetCluster()) {
    }

} // namespace shop::repositories
