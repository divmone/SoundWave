#pragma once

#include <functional>
#include <vector>
#include <optional>
#include <variant>
#include <cstdint>
#include <exceptions/DatabaseError.h>

template <typename T, typename K = int64_t, typename E = DatabaseError>
class DAO 
{
public:
    ~DAO() = default;

    std::variant<K, E> Create(const T& entity) {};
    std::variant<T, E> GetByID(K id) {};
    std::variant<bool, E> Update(K id, const T& entity) {};
    std::variant<bool, E> Delete(K id) {};
    std::variant<std::vector<T>, E> ReadAll() {};
    std::variant<bool, E> Exists(K id) {};
};