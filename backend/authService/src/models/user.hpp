#pragma once

#include <string>

namespace shop {
    struct User {
        int id;
        std::string google_id;
        std::string email;
        std::string username;
    };
}
