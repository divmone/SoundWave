#pragma once

#include <vector>
#include <variant>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Sounds.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class SoundRepository : public IDatabaseRepository<Sounds, std::string, DatabaseError>
{
public:
    SoundRepository() = default;
    ~SoundRepository() = default;

    std::variant<std::string, DatabaseError> Create(const Sounds& entity) override;
    std::variant<Sounds, DatabaseError> GetByID(std::string id) override;
    std::variant<bool, DatabaseError> Update(std::string id, const Sounds& entity) override;
    std::variant<bool, DatabaseError> Delete(std::string id) override;
    std::variant<std::vector<Sounds>, DatabaseError> ReadAll() override;
    std::variant<bool, DatabaseError> Exists(std::string id) override;

    std::variant<std::vector<Sounds>, DatabaseError> FindByUserId(const std::string& userId);
    std::variant<std::vector<Sounds>, DatabaseError> FindByFilename(const std::string& filename);
};

}