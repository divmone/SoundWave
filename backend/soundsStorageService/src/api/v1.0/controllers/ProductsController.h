#pragma once

#include <memory>
#include <drogon/HttpController.h>
#include <services/SoundDataService.h>
#include <services/ProductService.h>
#include <services/SoundService.h>
#include <services/TagService.h>
#include <middleware/ExceptonHandlerMiddleware.h>

namespace soundwaveSounds
{

using namespace drogon;

class ProductsController : public drogon::HttpController<ProductsController, false>
{
private:
    std::unique_ptr<SoundDataService> m_soundDataService = nullptr;
    std::unique_ptr<ProductService> m_productService = nullptr;
    std::unique_ptr<SoundService> m_soundService = nullptr;
    std::unique_ptr<TagService> m_tagService = nullptr;
public:
    explicit ProductsController(std::unique_ptr<SoundDataService> soundDataService,
                                std::unique_ptr<ProductService> productService, 
                                std::unique_ptr<SoundService> soundService, 
                                std::unique_ptr<TagService> tagService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(ProductsController::GetSoundsAmount, "api/v1.0/sounds/amount", Get, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::GetPageOfSounds, "api/v1.0/sounds/pages/{pageNum}", Get, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::GetSound, "api/v1.0/sounds/{id}", Get, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::GetUserSounds, "api/v1.0/sounds/user/{userId}", Get, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::UploadSound, "api/v1.0/sounds/user/{userId}/upload", Post, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::EditSound, "api/v1.0/sounds/{id}", Put, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::DeleteSound, "api/v1.0/sounds/{id}", Delete, "soundwaveSounds::ExceptonHandlerMiddleware");
        ADD_METHOD_TO(ProductsController::GetSoundData, "api/v1.0/sounds/{id}/data", Get, "soundwaveSounds::ExceptonHandlerMiddleware");
    METHOD_LIST_END
private:
    void GetSoundsAmount(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);
    void GetPageOfSounds(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t pageNum);
    void GetSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void GetUserSounds(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
    void UploadSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t userId);
    void EditSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void DeleteSound(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void GetSoundData(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
};

}