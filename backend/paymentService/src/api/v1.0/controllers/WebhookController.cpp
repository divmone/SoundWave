#include "WebhookController.h"
#include <drogon/drogon.h>

namespace soundwavePayment
{

void WebhookController::HandleStripeWebhook(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    responseJson["status"] = "received";
    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    httpResponse->setStatusCode(HttpStatusCode::k200OK);

    callback(httpResponse);
}

}