#pragma once

#include <userver/clients/http/client.hpp>
#include <userver/components/component_base.hpp>
#include <userver/storages/mongo/pool.hpp>

#include "repositories/CommentRepository.hpp"

namespace shop::services {
    class CommentService final : public userver::components::ComponentBase {
    public:
        static constexpr std::string_view kName = "comment-service";

        CommentService(const userver::components::ComponentConfig &,
                       const userver::components::ComponentContext &);

        CommentDto createComment(const std::string &text,
                                 const std::string &parentId,
                                 const std::string &productId,
                                 const std::string &
                                 token);

        std::string getIdByToken(const std::string& token) const;

        userver::formats::json::Value getAll(const std::string& soundId) const;
    private:
        shop::repositories::CommentRepository &commentRepository;
        userver::clients::http::Client& client;
    };
}
