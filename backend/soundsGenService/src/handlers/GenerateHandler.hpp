//
// Created by divmone on 4/30/2026.
//

#pragma once

#include <userver/server/handlers/http_handler_base.hpp>
#include "services/GenerateService.hpp"

using namespace userver;

class GenerateHandler final: public server::handlers::HttpHandlerBase{
public:
    static constexpr std::string_view kName = "handler-generate";

    GenerateHandler(const components::ComponentConfig&, const components::ComponentContext&);
    std::string HandleRequestThrow(const server::http::HttpRequest &request,
        server::request::RequestContext &context) const override;

private:
    shop::services::GenerateService& generateService;
};