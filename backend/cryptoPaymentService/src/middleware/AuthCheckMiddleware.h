//
// Created by dmitry on 25.04.2026.
//

#ifndef PAYMENTSERVICE_AUTHCHECKMIDDLEWARE_H
#define PAYMENTSERVICE_AUTHCHECKMIDDLEWARE_H

#include <drogon/HttpAppFramework.h>
#include <drogon/HttpClient.h>

namespace soundwaveCryptoPayment
{
    using namespace drogon;

    class AuthCheckMiddleware : public HttpMiddleware<AuthCheckMiddleware>
    {
    private:
        static constexpr std::size_t TOKEN_HEADER_OFFSET = 7;
        static constexpr const char* AUTH_SERVICE_HOST = "http://auth-service:8080";
        HttpClientPtr m_authServiceClient;
        bool m_isEnabled;
    public:
        AuthCheckMiddleware()
        {
            auto envValue = std::getenv("OAUTH_TOKEN_CHECK_ENABLED");

            std::string env = envValue ? envValue : "";
            if (env != "" && env == "false")
            {
                m_isEnabled = false;
                LOG_INFO << "Auth middleware was not enabled!";
            }
            else
            {
                m_isEnabled = true;
                m_authServiceClient = drogon::HttpClient::newHttpClient(AUTH_SERVICE_HOST);
                LOG_INFO << "Auth middleware launched";
            }
        }

        void invoke(const drogon::HttpRequestPtr &req,
                    MiddlewareNextCallback &&nextCb,
                    MiddlewareCallback &&mcb) override
        {
            LOG_INFO << "AuthCheckMiddleware invoked for path: " << req->path();
            
            if (!m_isEnabled)
            {
                LOG_INFO << "Auth middleware disabled, allowing request";
                nextCb
                (
                    [mcb = std::move(mcb)](const HttpResponsePtr &resp)
                    {
                        mcb(resp);
                    }
                );
                return;
            }

            const auto authHeader = req->getHeader("Authorization");
            LOG_INFO << "Auth header present: " << (!authHeader.empty() ? "yes" : "no");

            if (authHeader.size() > TOKEN_HEADER_OFFSET &&
                authHeader.substr(0, 7) == "Bearer ")
            {
                const auto token = authHeader.substr(TOKEN_HEADER_OFFSET);
                LOG_INFO << "Valid Bearer token detected, validating with auth-service";

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
                                LOG_INFO << "Request from user: " << userId;

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
                           LOG_INFO << "Invalid or expired token";
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
                    }, 5
                );
            }
            else
            {
                LOG_INFO << "Missing or invalid Authorization header";
                auto response = HttpResponse::newHttpResponse();
                response->setStatusCode(k401Unauthorized);
                response->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
                response->setBody("{\"error\":\"Missing or invalid Authorization header\"}");
                mcb(response);
            }

            fflush(stdout);
        }
    };
}

#endif //PAYMENTSERVICE_AUTHCHECKMIDDLEWARE_H