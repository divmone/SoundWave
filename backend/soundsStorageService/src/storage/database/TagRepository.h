#pragma once

#include <vector>
#include <variant>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Tags.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class TagRepository : public IDatabaseRepository<Tags, std::string, DatabaseError>
{
public:
    TagRepository() = default;
    ~TagRepository() = default;

    std::variant<std::string, DatabaseError> Create(const Tags& entity) override;
    std::variant<Tags, DatabaseError> GetByID(std::string id) override;
    std::variant<bool, DatabaseError> Update(std::string id, const Tags& entity) override;
    std::variant<bool, DatabaseError> Delete(std::string id) override;
    std::variant<std::vector<Tags>, DatabaseError> ReadAll() override;
    std::variant<bool, DatabaseError> Exists(std::string id) override;

    std::variant<Tags, DatabaseError> FindByName(const std::string& name);
    std::variant<std::vector<Tags>, DatabaseError> FindByNames(const std::vector<std::string>& names);
};

}