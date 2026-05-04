##output: {{HANDLER_NAME}}.cpp
//
// {{HANDLER_NAME}}.cpp
//

#include "{{HANDLER_NAME}}.hpp"
#include <userver/components/component_base.hpp>
#include <userver/components/component_context.hpp>

{{HANDLER_NAME}}::{{HANDLER_NAME}}(const components::ComponentConfig &config,
                                 const components::ComponentContext &context)
    : HttpHandlerBase(config, context)
{
}

std::string {{HANDLER_NAME}}::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {
    return HttpHandlerBase::HandleRequestThrow(request, context);
}
