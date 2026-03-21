#pragma once

#include <memory>
#include <vector>
#include <dto/requests/SoundRequestTo.h>
#include <dto/responses/SoundResponseTo.h>
#include <storage/database/SoundRepository.h>
#include <mapping/SoundMapper.h>
#include "exceptions/DatabaseException.h"
#include "exceptions/NotFoundException.h"
#include "exceptions/ValidationException.h"

namespace soundwaveSounds
{

class SoundRepository;

class SoundService
{
private:
    std::shared_ptr<SoundRepository> m_dao;

public:
    explicit SoundService(std::shared_ptr<SoundRepository> repository);

    dto::SoundResponseTo Create(const dto::SoundRequestTo& request);
    dto::SoundResponseTo Read(const std::string& id);
    dto::SoundResponseTo Update(const dto::SoundRequestTo& request, const std::string& id);
    bool Delete(const std::string& id);
    std::vector<dto::SoundResponseTo> GetAll();
    std::vector<dto::SoundResponseTo> GetByUserId(const std::string& userId);
    std::vector<dto::SoundResponseTo> GetByMimeType(const std::string& mimeType);
};

}