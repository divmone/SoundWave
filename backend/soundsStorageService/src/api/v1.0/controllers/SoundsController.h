#pragma once

#include <drogon/HttpController.h>

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

class SoundsController : public drogon::HttpController<SoundsController, false>
{
public:
    METHOD_LIST_BEGIN

    METHOD_LIST_END
private:
};
