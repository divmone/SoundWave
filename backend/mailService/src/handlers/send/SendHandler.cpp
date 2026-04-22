//
// Created by divmone on 4/16/2026.
//

#include "SendHandler.h"

#include <userver/components/component_context.hpp>

shop::handlers::SendHandler::SendHandler(
    const userver::components::ComponentConfig &config,
    const userver::components::ComponentContext &context)
    : HttpHandlerBase(config, context), sendService_(context.FindComponent<shop::services::SendService>()) {
}

std::string shop::handlers::SendHandler::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {


    const auto& body = request.RequestBody();

    auto json = formats::json::FromString(body);

    const auto& to = json["to"].As<std::string>();
    const auto& subject = json["subject"].As<std::string>();
    const auto& html = json["html"].As<std::string>();
    const auto& from = "mail@divmone.ru";

    const auto id = sendService_.send(to, from, html, subject);

    formats::json::ValueBuilder response;
    response["id"] = id;
    return formats::json::ToString(response.ExtractValue());
}
