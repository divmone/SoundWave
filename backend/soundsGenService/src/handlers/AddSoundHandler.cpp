//
// AddSoundHandler.cpp
//

#include "AddSoundHandler.hpp"
#include <userver/components/component_base.hpp>
#include <userver/components/component_context.hpp>

AddSoundHandler::AddSoundHandler(const components::ComponentConfig &config,
                                 const components::ComponentContext &context)
    : HttpHandlerBase(config, context)
    , generateService(context.FindComponent<shop::services::GenerateService>("service-generate"))
{
}

std::string AddSoundHandler::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {

    const auto& taskId = request.GetPathArg("id");
    const auto& rawToken = request.GetHeader("Authorization");
    std::string token;
    if (!rawToken.empty() &&  rawToken.substr(0, 7) == "Bearer ") {
        token = rawToken.substr(7);
    }

    return generateService.addGeneratedSound(taskId, token);
}
