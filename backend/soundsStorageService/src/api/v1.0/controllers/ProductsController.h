#pragma once

#include <memory>
#include <drogon/HttpController.h>
#include <services/SoundDataService.h>
#include <services/ProductService.h>
#include <services/SoundService.h>
#include <services/TagService.h>

namespace soundwaveSounds
{

using namespace drogon;

class ProductsController : public drogon::HttpController<ProductsController, false>
{
private:
    std::shared_ptr<SoundDataService> m_soundDataService = nullptr;
    std::shared_ptr<ProductService> m_productService = nullptr;
    std::shared_ptr<SoundService> m_soundService = nullptr;
    std::shared_ptr<TagService> m_tagService = nullptr;
public:
    explicit ProductsController(std::shared_ptr<SoundDataService> soundDataService,
                                std::shared_ptr<ProductService> productService, 
                                std::shared_ptr<SoundService> soundService, 
                                std::shared_ptr<TagService> tagService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(ProductsController::GetSoundsAmount, "api/v1.0/sounds/amount", Get,             "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::GetPageOfSounds, "api/v1.0/sounds/pages/{pageNum}", Get,    "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::GetSound, "api/v1.0/sounds/{id}", Get,                      "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::GetUserSounds, "api/v1.0/sounds/user/{userId}", Get,        "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::GetSoundData, "api/v1.0/sounds/by-tags", Get,               "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::UploadSound, "api/v1.0/sounds/user/{userId}/upload", Post,  "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::EditSound, "api/v1.0/sounds/{id}", Put,                     "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::DeleteSound, "api/v1.0/sounds/{id}", Delete,                "soundwaveSounds::GoogleAuthCheckMiddleware");
        ADD_METHOD_TO(ProductsController::GetSoundData, "api/v1.0/sounds/{id}/data", Get,             "soundwaveSounds::GoogleAuthCheckMiddleware");
    METHOD_LIST_END
private:
    void GetSoundsAmount(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);
    void GetPageOfSounds(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t pageNum);
    void GetSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void GetSoundsByTags(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void GetUserSounds(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
    void UploadSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
    void EditSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void DeleteSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void GetSoundData(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
};

}