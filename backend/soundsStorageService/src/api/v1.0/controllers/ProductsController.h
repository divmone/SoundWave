#pragma once

#include <memory>
#include <drogon/HttpController.h>
#include <services/ProductService.h>
#include <services/SoundService.h>
#include <services/TagService.h>

/*
    JSON UPLOADING FORMAT

    {
        "title": "Epic Battle Theme",
        "description": "Intense orchestral track for boss fights and dramatic moments",
        "price": "4.99",
        "tags": ["epic", "cinematic", "battle", "orchestral"],
        "originalName": "epic_battle_theme.mp3",
        "mimeType": "audio/mpeg",
        "durationSeconds": 180
    }

*/

/*/
 * SOUNDS SERVICE
 * ─────────────────────────────────────────────
 * GET    /sounds/amount               → общее количкство доступных звуков
 * GET    /sounds/pages/:pageNum       → Sound[] (все звуки по времени добавления, 1 страница - 9 звуков)
 * GET    /sounds/:id                  → Sound
 * GET    /sounds/user/:userId         → Sound[]
 * POST   /sounds/user/:userId/upload  → { id, message } (multipart)
 * PUT    /sounds/:id                  → Sound
 * DELETE /sounds/:id                  → null
 * GET    /sounds/:id/data             → ну типо сам файл
/*/

namespace soundwaveSounds
{

using namespace drogon;

class ProductsController : public drogon::HttpController<ProductsController, false>
{
private:
    std::unique_ptr<ProductService> m_productService = nullptr;
    std::unique_ptr<SoundService> m_soundService = nullptr;
    std::unique_ptr<TagService> m_tagService = nullptr;
public:
    explicit ProductsController(std::unique_ptr<ProductService> productService, std::unique_ptr<SoundService> soundService, std::unique_ptr<TagService> tagService);
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(ProductsController::GetSoundsAmount, "api/v1.0/sounds/amount", Get);
        ADD_METHOD_TO(ProductsController::GetPageOfSounds, "api/v1.0/sounds/pages/{pageNum}", Get);
        ADD_METHOD_TO(ProductsController::GetSound, "api/v1.0/sounds/{id}", Get);
        ADD_METHOD_TO(ProductsController::GetUserSounds, "api/v1.0/sounds/user/{userId}", Get);
        ADD_METHOD_TO(ProductsController::UploadSound, "api/v1.0/sounds/user/{userId}/upload");
        ADD_METHOD_TO(ProductsController::EditSound, "api/v1.0/sounds/{id}", Put);
        ADD_METHOD_TO(ProductsController::DeleteSound, "api/v1.0/sounds/{id}", Delete);
        ADD_METHOD_TO(ProductsController::GetSoundData, "api/v1.0/sounds/{id}/data", Get);
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

/*
private:
    std::unique_ptr<EditorService> m_service = nullptr;
public:
    explicit EditorController(std::unique_ptr<EditorService> service);
    
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(EditorController::CreateEditor, "/api/v1.0/editors", drogon::Post);
        ADD_METHOD_TO(EditorController::ReadEditor, "/api/v1.0/editors/{id}", drogon::Get);
        ADD_METHOD_TO(EditorController::UpdateEditorIdFromRoute, "/api/v1.0/editors/{id}", drogon::Put);
        ADD_METHOD_TO(EditorController::UpdateEditorIdFromBody, "/api/v1.0/editors", drogon::Put);
        ADD_METHOD_TO(EditorController::DeleteEditor, "/api/v1.0/editors/{id}", drogon::Delete);
        ADD_METHOD_TO(EditorController::GetAllEditors, "/api/v1.0/editors", drogon::Get);
    METHOD_LIST_END

private:
    void CreateEditor(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);
    void ReadEditor(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void UpdateEditorIdFromRoute(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void UpdateEditorIdFromBody(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);
    void DeleteEditor(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback, uint64_t id);
    void GetAllEditors(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback);

*/