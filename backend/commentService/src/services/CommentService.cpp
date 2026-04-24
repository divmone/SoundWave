#include "CommentService.hpp"

#include <userver/components/component_context.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/components/component_config.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/yaml_config/merge_schemas.hpp>
#include <userver/yaml_config/schema.hpp>

namespace shop::services {

userver::yaml_config::Schema CommentService::GetStaticConfigSchema() {
    return userver::yaml_config::MergeSchemas<userver::components::ComponentBase>(R"(
type: object
description: CommentService config
additionalProperties: false
properties:
    auth-service-url:
        type: string
        description: Auth service base URL
    sounds-service-url:
        type: string
        description: Sounds service base URL
    mail-service-url:
        type: string
        description: Mail service base URL
)");
}

CommentService::CommentService(
    const userver::components::ComponentConfig &config,
    const userver::components::ComponentContext &context)
    : ComponentBase(config, context)
    , commentRepository(context.FindComponent<shop::repositories::CommentRepository>())
    , client(context.FindComponent<userver::components::HttpClient>("http-client").GetHttpClient())
    , auth_url_(config["auth-service-url"].As<std::string>())
    , sounds_url_(config["sounds-service-url"].As<std::string>())
    , mail_url_(config["mail-service-url"].As<std::string>()) {
}

CommentDto CommentService::createComment(
    const std::string &text,
    const std::string &parentId,
    const std::string &productId,
    const std::string &token) {

    const auto userId = getIdByToken(token);
    const auto comment = commentRepository.create(text, parentId, productId, userId);

    try {
        notifyAuthor(productId, parentId, userId);
    } catch (...) {}

    return comment;
}

std::string CommentService::getIdByToken(const std::string &token) const {
    const auto response = client.CreateRequest()
        .get(auth_url_ + "/auth/me")
        .headers({{"Authorization", "Bearer " + token}})
        .timeout(std::chrono::seconds{5})
        .perform();

    if (response->status_code() != 200) return "";

    const auto json = userver::formats::json::FromString(response->body());
    return std::to_string(json["id"].As<int64_t>());
}

userver::formats::json::Value CommentService::getAll(const std::string &soundId) const {
    return commentRepository.getAll(soundId);
}

void CommentService::sendMail(const std::string& email, const std::string& username,
                              const std::string& subject, const std::string& html) const {
    userver::formats::json::ValueBuilder body;
    body["to"]      = email;
    body["subject"] = subject;
    body["html"]    = html;

    [[maybe_unused]] const auto mailResp = client.CreateRequest()
        .post(mail_url_ + "/send",
              userver::formats::json::ToString(body.ExtractValue()))
        .headers({{"Content-Type", "application/json"}})
        .timeout(std::chrono::seconds{5})
        .perform();
}

void CommentService::notifyAuthor(const std::string& productId, const std::string& parentId, const std::string& commenterUserId) const {
    // получаем трек → authorId + title
    const auto soundResp = client.CreateRequest()
        .get(sounds_url_ + "/api/v1.0/sounds/" + productId)
        .timeout(std::chrono::seconds{5})
        .perform();

    if (soundResp->status_code() != 200) return;

    const auto soundJson = userver::formats::json::FromString(soundResp->body());
    const auto authorId = soundJson["authorId"].As<int64_t>(0);
    const auto trackTitle = soundJson["title"].As<std::string>("");

    // уведомляем автора трека (если это не сам комментатор)
    if (authorId != 0 && std::to_string(authorId) != commenterUserId) {
        const auto userResp = client.CreateRequest()
            .get(auth_url_ + "/users/" + std::to_string(authorId))
            .timeout(std::chrono::seconds{5})
            .perform();

        if (userResp->status_code() == 200) {
            const auto userJson = userver::formats::json::FromString(userResp->body());
            const auto email    = userJson["email"].As<std::string>("");
            const auto username = userJson["username"].As<std::string>("");
            if (!email.empty()) sendMail(email, username,
                "New comment on your track \"" + trackTitle + "\"",
                "<p>Hi <b>" + username + "</b>,</p>"
                "<p>Someone left a comment on your track <b>\"" + trackTitle + "\"</b> on SoundWave.</p>"
                "<p><a href=\"https://soundwave.divmone.ru\">soundwave.divmone.ru</a></p>");
        }
    }

    // если это ответ на комментарий — уведомляем автора родительского комментария
    if (parentId.empty()) return;

    const auto parentComment = commentRepository.findById(parentId);
    if (!parentComment.has_value()) return;

    const auto& parentUserId = parentComment->userId;
    // не шлём если автор родительского комментария — тот же человек или автор трека
    if (parentUserId == commenterUserId || parentUserId == std::to_string(authorId)) return;

    const auto parentUserResp = client.CreateRequest()
        .get(auth_url_ + "/users/" + parentUserId)
        .timeout(std::chrono::seconds{5})
        .perform();

    if (parentUserResp->status_code() != 200) return;

    const auto parentUserJson = userver::formats::json::FromString(parentUserResp->body());
    const auto email    = parentUserJson["email"].As<std::string>("");
    const auto username = parentUserJson["username"].As<std::string>("");
    if (!email.empty()) sendMail(email, username,
        "Someone replied to your comment on \"" + trackTitle + "\"",
        "<p>Hi <b>" + username + "</b>,</p>"
        "<p>Someone replied to your comment on the track <b>\"" + trackTitle + "\"</b> on SoundWave.</p>"
        "<p><a href=\"https://soundwave.divmone.ru\">soundwave.divmone.ru</a></p>");
}

} // namespace shop::services
