//
// Created by dmitry on 08.04.2026.
//

#ifndef SOUNDWAVE_EXCEPTONHANDLERMIDDLEWARE_H
#define SOUNDWAVE_EXCEPTONHANDLERMIDDLEWARE_H

#include <drogon/HttpAppFramework.h>
#include "exceptions/DatabaseException.h"
#include "exceptions/NotFoundException.h"
#include "exceptions/ValidationException.h"

namespace soundwaveSounds
{
    using namespace drogon;

    class ExceptonHandlerMiddleware: public HttpMiddleware<ExceptonHandlerMiddleware>
    {
    public:
        ExceptonHandlerMiddleware() {};

        void invoke(const drogon::HttpRequestPtr &req,
                    MiddlewareNextCallback &&nextCb,
                    MiddlewareCallback &&mcb) override
        {
            try
            {
                nextCb
                (
                    [mcb = std::move(mcb)] (const HttpResponsePtr &resp)
                    {
                        mcb(resp);
                    }
                );
            }
            catch(const DatabaseException& e)
            {
                HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();
                Json::Value errorResponse;
                errorResponse["message"] = "Internal server error: " + std::string(e.what());
                httpResponse->setBody(Json::FastWriter().write(errorResponse));
                httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
                mcb(httpResponse);
            }
            catch(const NotFoundException& e)
            {
                HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();
                Json::Value errorResponse;
                errorResponse["message"] = e.what();
                httpResponse->setBody(Json::FastWriter().write(errorResponse));
                httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
                mcb(httpResponse);
            }
            catch (const ValidationException& e)
            {
                HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();
                Json::Value responseJson;
                responseJson["message"] = e.what();
                httpResponse->setBody(Json::FastWriter().write(responseJson));
                httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
                mcb(httpResponse);
            }
            catch (const std::exception& e)
            {
                HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();
                Json::Value responseJson;
                responseJson["message"] = e.what();
                httpResponse->setBody(Json::FastWriter().write(responseJson));
                httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
                mcb(httpResponse);
            }
        }
    };

}
#endif //SOUNDWAVE_EXCEPTONHANDLERMIDDLEWARE_H
