// TagRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Tags.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class TagRepository : public IDatabaseRepository<Tags, uint64_t, DatabaseError>
{
public:
    TagRepository() = default;
    ~TagRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const Tags& entity) override;
    std::variant<Tags, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const Tags& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<std::vector<Tags>, DatabaseError> ReadAll() override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;

    std::variant<Tags, DatabaseError> FindByName(const std::string& name);
    std::variant<std::vector<Tags>, DatabaseError> FindByNames(const std::vector<std::string>& names);
};

}