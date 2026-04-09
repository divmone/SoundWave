#pragma once

#include <memory>
#include <drogon/HttpController.h>
#include <services/TagService.h>

namespace soundwaveSounds
{

using namespace drogon;

class TagsController : public drogon::HttpController<TagsController, false>
{
private:
    std::shared_ptr<TagService> m_tagService = nullptr;
public:
    explicit TagsController(std::shared_ptr<TagService> tagService): m_tagService(tagService) {};
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(TagsController::GetTags, "api/v1.0/sounds/tags", Get);
    METHOD_LIST_END
private:
    void GetTags(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);
};

}