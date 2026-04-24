#include <string>
#include <userver/formats/json/value_builder.hpp>

struct CommentDto {
    std::string id;
    std::string productId;
    std::string userId;
    std::string parentId;
    std::string text;
    std::string createdAt;

    userver::formats::json::ValueBuilder ToJson() const{
        userver::formats::json::ValueBuilder b;
        b["id"]        = id;
        b["productId"] = productId;
        b["userId"]    = userId;
        b["parentId"]  = parentId;
        b["text"]      = text;
        b["createdAt"] = createdAt;
        return b;
    }
};
