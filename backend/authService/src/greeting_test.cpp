#include <greeting.hpp>

#include <userver/utest/utest.hpp>

using db_test::UserType;

UTEST(SayHelloTo, Basic) {
    EXPECT_EQ(db_test::SayHelloTo("Developer", UserType::kFirstTime), "Hello, Developer!\n");
    EXPECT_EQ(db_test::SayHelloTo({}, UserType::kFirstTime), "Hello, unknown user!\n");

    EXPECT_EQ(db_test::SayHelloTo("Developer", UserType::kKnown), "Hi again, Developer!\n");
    EXPECT_EQ(db_test::SayHelloTo({}, UserType::kKnown), "Hi again, unknown user!\n");
}