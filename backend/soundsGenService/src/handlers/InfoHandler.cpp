//
// InfoHandler.cpp
//

#include "InfoHandler.hpp"
#include <userver/components/component_base.hpp>
#include <userver/components/component_context.hpp>

InfoHandler::InfoHandler(const components::ComponentConfig &config,
                                 const components::ComponentContext &context)
    : HttpHandlerBase(config, context)
    , generateService(context.FindComponent<shop::services::GenerateService>("service-generate"))
{
}

std::string InfoHandler::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {

    const auto& soundId = request.GetPathArg("id");

    const auto soundInfo = generateService.getInfoBySoundId(soundId);

    formats::json::ValueBuilder result;
    result["soundId"] = soundId;
    result["prompt"] = soundInfo.prompt;
    result["response"] = soundInfo.response;

    return userver::formats::json::ToString(result.ExtractValue());;
}
