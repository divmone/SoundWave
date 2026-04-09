#pragma once

#include <memory>
#include <drogon/HttpController.h>
#include <services/TagService.h>
#include <middleware/ExceptonHandlerMiddleware.h>

namespace soundwaveSounds
{

using namespace drogon;

class TagsController : public drogon::HttpController<TagsController, false>
{
private:
    std::unique_ptr<TagService> m_tagService = nullptr;
public:
    explicit TagsController(std::unique_ptr<TagService> tagService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(TagsController::GetTags, "api/v1.0/sounds/tags", Get, "soundwaveSounds::ExceptonHandlerMiddleware");
    METHOD_LIST_END
private:
    void GetTags(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);
};

}