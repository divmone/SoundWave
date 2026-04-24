#pragma once

#include <userver/clients/http/client.hpp>
#include <userver/components/component_base.hpp>
#include <userver/storages/mongo/pool.hpp>

#include "models/Comment.hpp"

namespace shop::repositories {
    class CommentRepository final: public userver::components::ComponentBase{
    public:
        static constexpr std::string_view kName = "comment-repository";
        CommentRepository(const userver::components::ComponentConfig&, const userver::components::ComponentContext&);

        CommentDto create(const std::string &text, const std::string &parentId,
                          const std::string &
                          productId,
                          const std::string &userId);

        userver::formats::json::Value getAll(const std::string& soundId);
    private:
        userver::storages::mongo::PoolPtr mongoPool_;
    };
}
