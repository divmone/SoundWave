#pragma once

#include <userver/server/handlers/http_handler_base.hpp>

#include "services/CommentService.hpp"

namespace shop::handlers {

    class CommentGet final : public userver::server::handlers::HttpHandlerBase {
    public:
        static constexpr std::string_view kName = "handler-comment-get";

        CommentGet(const userver::components::ComponentConfig& config,
                    const userver::components::ComponentContext& context);

        std::string HandleRequestThrow(const userver::server::http::HttpRequest&, userver::server::request::RequestContext&)
            const override;

    private:
        services::CommentService& commentService;
    };

}  // namespace commentService