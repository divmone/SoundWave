//
// Created by dmitry on 09.04.2026.
//

#ifndef SOUNDSSTORAGESERVICE_GLOBALHANDLER_H
#define SOUNDSSTORAGESERVICE_GLOBALHANDLER_H

#include <drogon/HttpAppFramework.h>

#include "ValidationException.h"
#include "exceptions/DatabaseException.h"
#include "exceptions/NotFoundException.h"

void GlobalExceptionHandler(const std::exception& e,
                            const drogon::HttpRequestPtr& req,
                            std::function<void(const drogon::HttpResponsePtr&)> &&callback)
{
    auto httpResponse = drogon::HttpResponse::newHttpResponse();
    Json::Value responseJson;

    if (dynamic_cast<const DatabaseException*>(&e))
    {
        responseJson["message"] = "Internal server error: " + std::string(e.what());
        httpResponse->setStatusCode(drogon::k500InternalServerError);
    }
    else if (dynamic_cast<const NotFoundException*>(&e))
    {
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(drogon::k404NotFound);
    }
    else if (dynamic_cast<const ValidationException*>(&e))
    {
        responseJson["message"] = e.what();
        httpResponse->setStatusCode(drogon::k400BadRequest);
    }
    else
    {
        responseJson["message"] = "An unknown error occurred";
        httpResponse->setStatusCode(drogon::k500InternalServerError);
    }

    httpResponse->setBody(Json::FastWriter().write(responseJson));
    httpResponse->setContentTypeCode(drogon::CT_APPLICATION_JSON);

    callback(std::move(httpResponse));
}

#endif //SOUNDSSTORAGESERVICE_GLOBALHANDLER_H
