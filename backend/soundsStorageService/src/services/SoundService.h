#pragma once

#include <memory>
#include <vector>
#include <string>
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
    dto::SoundResponseTo Read(const std::string& id);
    dto::SoundResponseTo Update(const dto::SoundRequestTo& request, const std::string& id);
    bool Delete(const std::string& id);
    std::vector<dto::SoundResponseTo> GetAll();
    std::vector<dto::SoundResponseTo> GetByUserId(const std::string& userId);
    std::vector<dto::SoundResponseTo> GetByFilename(const std::string& filename);

private:
    std::shared_ptr<SoundRepository> m_dao;
};

}