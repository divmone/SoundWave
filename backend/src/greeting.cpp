#include <greeting.hpp>

#include <fmt/format.h>

#include <userver/utils/assert.hpp>

namespace db_test {

std::string SayHelloTo(std::string_view name, UserType type) {
    if (name.empty()) {
        name = "unknown user";
    }

    switch (type) {
        case UserType::kFirstTime:
            return fmt::format("Hello0000, {}!\n", name);
        case UserType::kKnown:
            return fmt::format("Hi1111111111111 again, {}!\n", name);
    }

    UASSERT(false);
}

}  // namespace db_test