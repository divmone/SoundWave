//
// Created by dmitry on 08.04.2026.
//

#ifndef SOUNDSSTORAGESERVICE_JWTAUTHCHECKMIDDLEWARE_H
#define SOUNDSSTORAGESERVICE_JWTAUTHCHECKMIDDLEWARE_H

#include <drogon/HttpAppFramework.h>
#include <drogon/HttpClient.h>

namespace soundwaveSounds
{
    using namespace drogon;

    class JWTAuthCheckMiddleware : public HttpMiddleware<JWTAuthCheckMiddleware>
    {
    private:
        static constexpr std::size_t TOKEN_HEADER_OFFSET = 7;
        static constexpr const char* AUTH_SERVICE_HOST = "http://auth-service:8080";
        HttpClientPtr m_authServiceClient;

    public:
        JWTAuthCheckMiddleware()
        {
            m_authServiceClient = drogon::HttpClient::newHttpClient(AUTH_SERVICE_HOST);
        }

        void invoke(const drogon::HttpRequestPtr &req,
                    MiddlewareNextCallback &&nextCb,
                    MiddlewareCallback &&mcb) override
        {
            const auto authHeader = req->getHeader("Authorization");

            if (authHeader.size() > TOKEN_HEADER_OFFSET &&
                authHeader.substr(0, 7) == "Bearer ")
            {
                const auto token = authHeader.substr(TOKEN_HEADER_OFFSET);

                auto authRequest = HttpRequest::newHttpRequest();
                authRequest->setMethod(drogon::Get);
                authRequest->setPath("/auth/me");
                authRequest->addHeader("Authorization", "Bearer " + token);

                m_authServiceClient->sendRequest(
                    authRequest,
                    [req, nextCb = std::move(nextCb), mcb = std::move(mcb)](ReqResult result, const HttpResponsePtr& authResponse) mutable
                    {
                        if (result == ReqResult::Ok && authResponse && authResponse->getStatusCode() == k200OK)
                        {
                            auto json = authResponse->getJsonObject();
                            if (json && json->isMember("id"))
                            {
                                int64_t userId = (*json)["id"].asInt64();
                                LOG_DEBUG << "Request from user: " << userId;

                                nextCb
                                (
                                    [mcb = std::move(mcb)](const HttpResponsePtr &resp)
                                    {
                                        mcb(resp);
                                    }
                                );
                                return;
                            }
                            else
                            {
                                LOG_ERROR << "Auth response missing 'id' field";
                            }
                        }
                        else if (authResponse && authResponse->getStatusCode() == k401Unauthorized)
                        {
                            LOG_DEBUG << "Invalid or expired token";
                        }
                        else
                        {
                            LOG_ERROR << "Auth service error: " << static_cast<int>(result);
                        }

                        auto response = HttpResponse::newHttpResponse();
                        response->setStatusCode(k401Unauthorized);
                        response->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                        response->setBody("{\"error\":\"Unauthorized\"}");
                        mcb(response);
                    }
                );
            }
            else
            {
                LOG_DEBUG << "Missing or invalid Authorization header";
                auto response = HttpResponse::newHttpResponse();
                response->setStatusCode(k401Unauthorized);
                response->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                response->setBody("{\"error\":\"Missing or invalid Authorization header\"}");
                mcb(response);
            }
        }
    };
}

#endif //SOUNDSSTORAGESERVICE_JWTAUTHCHECKMIDDLEWARE_H