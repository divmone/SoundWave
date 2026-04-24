#include "CommentPost.hpp"

#include <userver/components/component_context.hpp>

namespace shop::handlers {
    CommentPost::CommentPost(const userver::components::ComponentConfig &config,
                             const userver::components::ComponentContext &
                             context)
        : HttpHandlerBase(config, context)
        , commentService(context.FindComponent<shop::services::CommentService>()) {
    }

    std::string
    CommentPost::HandleRequestThrow(
        const userver::server::http::HttpRequest &request,
        userver::server::request::RequestContext &)
    const {
        const auto& soundId = request.GetPathArg("soundId");
        const auto& body = userver::formats::json::FromString(request.RequestBody());
        const auto& text = body["text"].As<std::string>();
        const auto& parentId = body["parentId"].As<std::string>();
        const auto& token = request.GetHeader("Authorization").substr(7);

        const auto& comment = commentService.createComment(text, parentId, soundId, token);
        request.GetHttpResponse().SetContentType("application/json");
        return userver::formats::json::ToString(comment.ToJson().ExtractValue());
    }
}
