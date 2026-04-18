#include <greeting.hpp>

#include <userver/utest/utest.hpp>

using paymentService::UserType;

UTEST(SayHelloTo, Basic) {
    EXPECT_EQ(paymentService::SayHelloTo("Developer", UserType::kFirstTime), "Hello, Developer!\n");
    EXPECT_EQ(paymentService::SayHelloTo({}, UserType::kFirstTime), "Hello, unknown user!\n");

    EXPECT_EQ(paymentService::SayHelloTo("Developer", UserType::kKnown), "Hi again, Developer!\n");
    EXPECT_EQ(paymentService::SayHelloTo({}, UserType::kKnown), "Hi again, unknown user!\n");
}