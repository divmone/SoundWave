##output: {{HANDLER_NAME}}.hpp
//
// {{HANDLER_NAME}}.hpp
//

#pragma once

#include <userver/server/handlers/http_handler_base.hpp>

using namespace userver;

class {{HANDLER_NAME}} final: public server::handlers::HttpHandlerBase{
public:
    static constexpr std::string_view kName = "{{HANDLER_KEBAB}}";

    {{HANDLER_NAME}}(const components::ComponentConfig&, const components::ComponentContext&);
    std::string HandleRequestThrow(const server::http::HttpRequest &request,
        server::request::RequestContext &context) const override;
};
