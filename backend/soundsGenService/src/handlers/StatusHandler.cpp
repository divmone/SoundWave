//
// StatusHandler.cpp
//

#include "StatusHandler.hpp"
#include <userver/components/component_base.hpp>
#include <userver/components/component_context.hpp>

StatusHandler::StatusHandler(const components::ComponentConfig &config,
                                 const components::ComponentContext &context)
    : HttpHandlerBase(config, context)
    , generateService(context.FindComponent<shop::services::GenerateService>("service-generate"))
{
}

std::string StatusHandler::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {

    const auto statusId = request.GetPathArg("id");
    if (!statusId.data() || statusId.empty()) {
        throw server::handlers::ClientError();
    }

    const auto status = generateService.getTaskStatus(statusId);

    request.SetResponseStatus(server::http::HttpStatus::kOk);
    return status;
}
