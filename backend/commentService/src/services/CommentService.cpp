#include "CommentService.hpp"

#include <userver/components/component_context.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/formats/json.hpp>

shop::services::CommentService::CommentService(
    const userver::components::ComponentConfig &config,
    const userver::components::ComponentContext &context)
    : ComponentBase(config, context)
      , commentRepository(
          context.FindComponent<shop::repositories::CommentRepository>())
      , client(context.FindComponent<userver::components::HttpClient>("http-client").GetHttpClient()) {
}

CommentDto shop::services::CommentService::createComment(
    const std::string &text,
    const std::string &parentId, const std::string &productId, const std::string
    &token) {

    const auto userId = getIdByToken(token);
    return commentRepository.create(text, parentId, productId, userId);
}

std::string shop::services::CommentService::getIdByToken(
    const std::string &token) const {
    const auto response = client.CreateRequest()
            .get("http://auth-service:8080/auth/me")
            .headers({{"Authorization", "Bearer " + token}})
            .timeout(std::chrono::seconds{5})
            .perform();

    if (response->status_code() != 200) {
        return "";
    }

    const auto json = userver::formats::json::FromString(response->body());
    const auto userId = std::to_string(json["id"].As<int64_t>());
    return userId;
}

userver::formats::json::Value shop::services::CommentService::getAll(
    const std::string &soundId) const {

    return commentRepository.getAll(soundId);
}
