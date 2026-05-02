//
// Created by divmone on 4/30/2026.
//

#include "GenerateService.hpp"
#include <userver/components/component_context.hpp>
#include <userver/components/component_config.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/clients/http/client_core.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/server/handlers/exceptions.hpp>
#include <userver/yaml_config/schema.hpp>
#include <userver/yaml_config/merge_schemas.hpp>

shop::services::GenerateService::GenerateService(
    const components::ComponentConfig &config,
    const components::ComponentContext &context)
    : ComponentBase(config, context)
      , httpClient(context.FindComponent<components::HttpClient>("http-client").GetHttpClient())
      , apiKey("Bearer " + config["api-key"].As<std::string>())  {
}

std::string shop::services::GenerateService::generateSound(
    const std::string &prompt) {
    formats::json::ValueBuilder json;
    json["prompt"] = prompt;
    json["model"] = "V5";
    json["customMode"] = false;

    const auto response = httpClient.CreateRequest()
            .post("https://api.sunoapi.org/api/v1/generate")
            .headers({
                {
                    "Authorization", apiKey
                },
                {
                    "'Content-Type", "application/json"
                }
            })
            .timeout(std::chrono::seconds{30})
            .data(ToString(json.ExtractValue()))
            .perform();

    if (!response || response->status_code() != http::StatusCode::kOk) {
        throw server::handlers::ClientError();
    }

    return response->body();
}

std::string shop::services::GenerateService::getTaskStatus(const std::string &taskId) const {
    const auto response = httpClient
        .CreateRequest()
        .get("https://api.sunoapi.org/api/v1/generate/record-info?taskId=" + taskId)
        .headers({{"Authorization", apiKey}})
        .perform();

    if (!response || response->status_code() != http::StatusCode::kOk) {
        throw server::handlers::ClientError();
    }

    return response->body();
}

yaml_config::Schema shop::services::GenerateService::GetStaticConfigSchema() {
    return userver::yaml_config::MergeSchemas<
            ComponentBase>(R"(
type: object
description: generateService config
additionalProperties: false
properties:
    api-key:
        type: string
        description: Api key for Suno
)");
}
