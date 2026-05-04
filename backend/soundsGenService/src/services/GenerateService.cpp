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
      , apiKey("Bearer " + config["api-key"].As<std::string>())
      , repository_(context.FindComponent<repositories::GenerateRepository>("repository-generate"))
      , auth_url_(config["auth-service-url"].As<std::string>())
      , sounds_url_(config["sounds-service-url"].As<std::string>())
{
}

std::string shop::services::GenerateService::generateSound(
    const std::string &prompt) {
    formats::json::ValueBuilder json;
    json["prompt"] = prompt;
    json["model"] = "V5";
    json["customMode"] = false;
    json["instrumental"] = false;
    json["callBackUrl"] = "soundwave.divmone.ru/generate/callback";

    const auto response = httpClient.CreateRequest()
            .post("https://api.sunoapi.org/api/v1/generate")
            .headers({
                {
                    "Authorization", apiKey
                },
                {
                    "Content-Type", "application/json"
                }
            })
            .timeout(std::chrono::seconds{30})
            .data(ToString(json.ExtractValue()))
            .perform();

    if (!response || response->status_code() != http::StatusCode::kOk) {
        throw server::handlers::ClientError();
    }

    const auto& jsonResponse = formats::json::FromString(response->body());
    const auto& taskId = jsonResponse["data"]["taskId"].As<std::string>();

    repository_.insertTask(taskId, prompt);

    return taskId;
}

std::string shop::services::GenerateService::getTaskStatus(const std::string &taskId) const {
    const auto response = httpClient
        .CreateRequest()
        .get("https://api.sunoapi.org/api/v1/generate/record-info?taskId=" + taskId)
        .headers({{"Authorization", apiKey}})
        .timeout(std::chrono::seconds(10))
        .perform();

    if (!response || response->status_code() != http::StatusCode::kOk) {
        throw server::handlers::ClientError();
    }

    const auto bodyToJson = formats::json::FromString(response->body());
    const auto status = bodyToJson["data"]["status"].As<std::string>();
    return status;
}

std::string shop::services::GenerateService::getTaskInfo(
    const std::string &taskId) const {

    const auto response = httpClient
      .CreateRequest()
      .get("https://api.sunoapi.org/api/v1/generate/record-info?taskId=" + taskId)
      .headers({{"Authorization", apiKey}})
      .timeout(std::chrono::seconds(10))
      .perform();

    if (!response || response->status_code() != http::StatusCode::OK) {
        throw server::handlers::ClientError();
    }

    return response->body();
}

std::string shop::services::GenerateService::addGeneratedSound(
    const std::string &taskId, const std::string &token) {

    const auto id = getIdByToken(token);

    const auto taskInfo = getTaskInfo(taskId);
    const auto jsonTaskInfo = formats::json::FromString(taskInfo);

    const auto& audioUrl = jsonTaskInfo["data"]["response"]["sunoData"][0]["audioUrl"].As<std::string>();

    formats::json::ValueBuilder dataJson;
    dataJson["soundUrl"] = audioUrl;

    const auto response = httpClient
                                                .CreateRequest()
                                                .post(sounds_url_ + "/api/v1.0/sounds/user/" + id + "/uploadAiSound")
                                                .headers({{"Content-Type", "application/json"},
                                                            {"Authorization", "Bearer " + token}})
                                                .data(formats::json::ToString(dataJson.ExtractValue()))
                                                .timeout(std::chrono::seconds(30))
                                                .perform();

    if (response->status_code() != http::StatusCode::OK) {
        throw server::handlers::ClientError();
    }

    const auto& responseJson = formats::json::FromString(response->body());
    const auto& soundId = responseJson["soundId"].As<std::string>();
    if (soundId.empty()) {
        throw server::handlers::ClientError();
    }

    repository_.updateTaskResponse(taskId, taskInfo, soundId);

    return soundId;
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
    auth-service-url:
        type: string
        description: Auth service base URL
    sounds-service-url:
        type: string
        description: Sounds service base URL
)");
}

GeneratedSoundInfo shop::services::GenerateService::
getInfoBySoundId(const std::string &soundId) {
    return repository_.getInfoBySoundid(soundId);
}

std::string shop::services::GenerateService::getIdByToken(
    const std::string &token) const {
    const auto response = httpClient.CreateRequest()
    .get(auth_url_ + "/auth/me")
    .headers({{"Authorization", "Bearer " + token}})
    .timeout(std::chrono::seconds{5})
    .perform();

    if (response->status_code() != 200) return "";

    const auto json = formats::json::FromString(response->body());
    return std::to_string(json["id"].As<int64_t>());

}
