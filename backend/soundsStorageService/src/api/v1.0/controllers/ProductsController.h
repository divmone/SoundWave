#pragma once

#include <drogon/HttpController.h>
#include <services/SoundService.h>

/*/
 * SOUNDS SERVICE
 * ─────────────────────────────────────────────
 * GET    /sounds               → { items, total, page, pages }
 * GET    /sounds/:id           → Sound
 * GET    /sounds/user/:userId  → Sound[]
 * POST   /sounds/upload        → { id, message } (multipart)
 * PUT    /sounds/:id           → Sound
 * DELETE /sounds/:id           → null
 * GET    /sounds/:id/stream    → audio stream
/*/

using namespace drogon;

class ProductsController : public drogon::HttpController<ProductsController, false>
{
private:
    
public:
    explicit ProductsController();
    METHOD_LIST_BEGIN

    METHOD_LIST_END
private:
};


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