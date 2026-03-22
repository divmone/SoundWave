// SoundRepository.h
#pragma once

#include <vector>
#include <variant>
#include <cstdint>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include "IDatabaseRepository.h"
#include <models/Sounds.h>
#include <exceptions/DatabaseError.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class SoundRepository : public IDatabaseRepository<Sounds, uint64_t, DatabaseError>
{
public:
    SoundRepository() = default;
    ~SoundRepository() = default;

    std::variant<uint64_t, DatabaseError> Create(const Sounds& entity) override;
    std::variant<Sounds, DatabaseError> GetByID(uint64_t id) override;
    std::variant<bool, DatabaseError> Update(uint64_t id, const Sounds& entity) override;
    std::variant<bool, DatabaseError> Delete(uint64_t id) override;
    std::variant<std::vector<Sounds>, DatabaseError> ReadAll() override;
    std::variant<bool, DatabaseError> Exists(uint64_t id) override;

    std::variant<std::vector<Sounds>, DatabaseError> FindByUserId(uint64_t userId);
    std::variant<std::vector<Sounds>, DatabaseError> FindByFilename(const std::string& filename);
};

}