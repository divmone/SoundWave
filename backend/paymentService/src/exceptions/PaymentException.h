#pragma once

#include <stdexcept>
#include <string>

class PaymentException : public std::runtime_error
{
public:
    explicit PaymentException(const std::string& message)
        : std::runtime_error(message)
    {
    }
};