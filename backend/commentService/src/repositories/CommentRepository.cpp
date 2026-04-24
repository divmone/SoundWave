#include "CommentRepository.hpp"

#include <userver/components/component_context.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/formats/bson.hpp>
#include <userver/utils/datetime.hpp>

shop::repositories::CommentRepository::CommentRepository(
    const userver::components::ComponentConfig &config,
    const userver::components::ComponentContext &context)
    : ComponentBase(config, context)
    , mongoPool_(context.FindComponent<userver::components::Mongo>("mongo-db-1").GetPool())
{
}

CommentDto shop::repositories::CommentRepository::create(
    const std::string &text,
    const std::string &parentId,
    const std::string &productId,
    const std::string &userId) {

    auto collection = mongoPool_->GetCollection("comments");

    const auto oid = userver::formats::bson::Oid();

    collection.InsertOne(
        userver::formats::bson::MakeDoc(
            "_id",       oid,
            "text",      text,
            "parentId",  parentId,
            "productId", productId,
            "userId",    userId,
            "createdAt", userver::utils::datetime::Now()
        )
    );

    return CommentDto{
        .id        = oid.ToString(),
        .productId = productId,
        .userId    = userId,
        .parentId  = parentId,
        .text      = text,
        .createdAt = userver::utils::datetime::Timestring(userver::utils::datetime::Now()),
    };
}

userver::formats::json::Value shop::repositories::CommentRepository::getAll(const std::string& soundId) {
    auto collection = mongoPool_->GetCollection("comments");
    auto cursor = collection.Find(
        userver::formats::bson::MakeDoc("productId", soundId)
    );

    userver::formats::json::ValueBuilder result(userver::formats::json::Type::kArray);
    for (auto doc : cursor) {
        userver::formats::json::ValueBuilder item;
        item["id"]        = doc["_id"].As<userver::formats::bson::Oid>().ToString();
        item["productId"] = doc["productId"].As<std::string>();
        item["userId"]    = doc["userId"].As<std::string>();
        item["parentId"]  = doc["parentId"].As<std::string>();
        item["text"]      = doc["text"].As<std::string>();
        item["createdAt"] = userver::utils::datetime::Timestring(
            doc["createdAt"].As<std::chrono::system_clock::time_point>());
        result.PushBack(std::move(item));
    }
    return result.ExtractValue();
}


