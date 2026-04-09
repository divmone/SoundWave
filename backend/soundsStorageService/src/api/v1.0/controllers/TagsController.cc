#include "TagsController.h"

using namespace soundwaveSounds;

void TagsController::GetTags(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();
    Json::Value responseJson;

    auto dtos = m_tagService->GetAll();
    Json::Value jsonResponse(Json::arrayValue);

    for (auto& dto: dtos)
    {
        jsonResponse.append(dto.toJson());
    }

    std::string responseBody = Json::FastWriter().write(jsonResponse);
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    httpResponse->setBody(responseBody);
    httpResponse->setStatusCode(HttpStatusCode::k200OK);;

    fflush(stdout);
    callback(httpResponse);
}
