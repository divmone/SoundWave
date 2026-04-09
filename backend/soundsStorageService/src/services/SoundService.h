// SoundService.h
#pragma once

#include <memory>
#include <vector>
#include <string>
#include <cstdint>
#include <dto/requests/SoundRequestTo.h>
#include <dto/responses/SoundResponseTo.h>

namespace soundwaveSounds
{

class SoundRepository;

class SoundService
{
public:
    explicit SoundService(std::shared_ptr<SoundRepository> repository);

    dto::SoundResponseTo Create(const dto::SoundRequestTo& request);
    dto::SoundResponseTo Read(uint64_t id);
    dto::SoundResponseTo Update(const dto::SoundRequestTo& request, uint64_t id);
    bool Delete(uint64_t id);
    std::vector<dto::SoundResponseTo> GetAll();
    std::vector<dto::SoundResponseTo> GetByUserId(uint64_t userId);
    std::vector<dto::SoundResponseTo> GetByFilename(const std::string& filename);
    std::vector<dto::SoundResponseTo> GetByTagIds(const std::vector<uint64_t>& tagIds);
private:
    std::shared_ptr<SoundRepository> m_dao;
};

}