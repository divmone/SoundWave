//
// Created by dmitry on 08.04.2026.
//

#ifndef SOUNDSSTORAGESERVICE_JWTAUTHCHECKMIDDLEWARE_H
#define SOUNDSSTORAGESERVICE_JWTAUTHCHECKMIDDLEWARE_H

#include <drogon/HttpAppFramework.h>
#include "exceptions/DatabaseException.h"
#include "exceptions/NotFoundException.h"
#include "exceptions/ValidationException.h"

namespace soundwaveSounds
{
    using namespace drogon;

    class JWTAuthCheckFilter: public HttpMiddleware<JWTAuthCheckFilter>
    {
    public:
        JWTAuthCheckFilter() {};

        void invoke(const drogon::HttpRequestPtr &req,
                    MiddlewareNextCallback &&nextCb,
                    MiddlewareCallback &&mcb) override
        {

        }
    };

}


#endif //SOUNDSSTORAGESERVICE_JWTAUTHCHECKMIDDLEWARE_H
