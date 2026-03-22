// TagService.h
#pragma once

#include <memory>
#include <vector>
#include <string>
#include <cstdint>
#include <dto/requests/TagRequestTo.h>
#include <dto/responses/TagResponseTo.h>
#include <storage/database/TagRepository.h>

namespace soundwaveSounds
{

class TagService
{
public:
    explicit TagService(std::shared_ptr<TagRepository> repository);

    dto::TagResponseTo Create(const dto::TagRequestTo& request);
    dto::TagResponseTo Read(uint64_t id);
    dto::TagResponseTo Update(const dto::TagRequestTo& request, uint64_t id);
    bool Delete(uint64_t id);
    std::vector<dto::TagResponseTo> GetAll();
    dto::TagResponseTo GetByName(const std::string& name);
    std::vector<dto::TagResponseTo> GetByNames(const std::vector<std::string>& names);

private:
    std::shared_ptr<TagRepository> m_dao;
};

}