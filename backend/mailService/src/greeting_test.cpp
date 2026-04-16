#include <greeting.hpp>

#include <userver/utest/utest.hpp>

using mailService::UserType;

UTEST(SayHelloTo, Basic) {
    EXPECT_EQ(mailService::SayHelloTo("Developer", UserType::kFirstTime), "Hello, Developer!\n");
    EXPECT_EQ(mailService::SayHelloTo({}, UserType::kFirstTime), "Hello, unknown user!\n");

    EXPECT_EQ(mailService::SayHelloTo("Developer", UserType::kKnown), "Hi again, Developer!\n");
    EXPECT_EQ(mailService::SayHelloTo({}, UserType::kKnown), "Hi again, unknown user!\n");
}