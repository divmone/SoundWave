//
// Created by divmone on 3/11/2026.
//

#include "GenerateRepository.hpp"

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/handler_base.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/server/handlers/exceptions.hpp>

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

    void GenerateRepository::insertTask(const std::string &taskId,
        const std::string &prompt) {

        pg_cluster->Execute(
            userver::storages::postgres::ClusterHostType::kMaster,
            "INSERT INTO sound_generations(task_id, prompt) VALUES($1, $2)",
            taskId, prompt);

    }

    void GenerateRepository::updateTaskResponse(const std::string &taskId,
        const std::string &responseJson, const std::string& soundId) {

        pg_cluster->Execute(
       userver::storages::postgres::ClusterHostType::kMaster,
       "UPDATE sound_generations "
       "SET response = $2::jsonb, status = 'completed', updated_at = now(), sound_id = $3 "
       "WHERE task_id = $1",
       taskId, responseJson, soundId
   );


    }

    GeneratedSoundInfo GenerateRepository::getInfoBySoundid(const std::string &soundId) {
        const auto result = pg_cluster->Execute(
       userver::storages::postgres::ClusterHostType::kSlave,
       "SELECT prompt, response::text AS response FROM sound_generations WHERE sound_id = $1",
       soundId
   );

        if (result.IsEmpty()) {
            throw userver::server::handlers::ClientError();
        }

        const auto row = result.Front();
        return GeneratedSoundInfo {
            .soundId  = soundId,
            .response = row["response"].As<std::string>(),
            .prompt   = row["prompt"].As<std::string>()
        };
    }
} // namespace shop::repositories
