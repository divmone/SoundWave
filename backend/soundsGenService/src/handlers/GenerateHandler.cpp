//
// Created by divmone on 4/30/2026.
//

#include "GenerateHandler.hpp"
#include <userver/components/component_base.hpp>
#include <userver/components/component_context.hpp>

GenerateHandler::GenerateHandler(const components::ComponentConfig &config,
                                 const components::ComponentContext &context)
        : HttpHandlerBase(config, context)
        , generateService(context.FindComponent<shop::services::GenerateService>("service-generate")){
}

std::string GenerateHandler::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {

    const auto& body = request.RequestBody();
    const auto& json = formats::json::FromString(body);
    const auto& prompt = json["prompt"].As<std::string>();

    const auto id = generateService.generateSound(prompt);
    return id;
}
