#pragma once

#include <string>

namespace shop {
    struct User {
        int id;
        std::string email;
        std::string username;
        std::string avatar_url;
    };
}
