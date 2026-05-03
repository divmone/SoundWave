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
    return HttpHandlerBase::HandleRequestThrow(request, context);
}
