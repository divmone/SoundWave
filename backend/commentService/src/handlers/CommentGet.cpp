#include "CommentGet.hpp"

#include <userver/components/component_context.hpp>

namespace shop::handlers {
    CommentGet::CommentGet(const userver::components::ComponentConfig &config,
                             const userver::components::ComponentContext &
                             context)
        : HttpHandlerBase(config, context)
        , commentService(context.FindComponent<shop::services::CommentService>()) {
    }

    std::string
    CommentGet::HandleRequestThrow(
        const userver::server::http::HttpRequest &request,
        userver::server::request::RequestContext &)
    const {
        const auto& soundId = request.GetPathArg("soundId");
        const auto& comments = commentService.getAll(soundId);
        request.GetHttpResponse().SetContentType("application/json");
        return userver::formats::json::ToString(comments);
    }
}
