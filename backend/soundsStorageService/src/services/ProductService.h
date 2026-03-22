#pragma once

#include <memory>
#include <vector>
#include <string>
#include <dto/requests/ProductRequestTo.h>
#include <dto/responses/ProductResponseTo.h>
#include <models/Products.h>

namespace soundwaveSounds
{

using namespace drogon_model::soundwaveSounds;

class ProductRepository;
class TagRepository;
class ProductTagRepository;

class ProductService
{
public:
    explicit ProductService(
        std::shared_ptr<ProductRepository> productRepository,
        std::shared_ptr<TagRepository> tagRepository,
        std::shared_ptr<ProductTagRepository> productTagRepository);

    dto::ProductResponseTo Create(const dto::ProductRequestTo& request);
    dto::ProductResponseTo Read(const std::string& id);
    dto::ProductResponseTo Update(const dto::ProductRequestTo& request, const std::string& id);
    bool Delete(const std::string& id);
    uint64_t GetAmount();
    std::vector<dto::ProductResponseTo> GetAll();
    std::vector<dto::ProductResponseTo> GetSoundsPage(const uint64_t pageNum);
    std::vector<dto::ProductResponseTo> GetByAuthorId(const std::string& authorId);
    std::vector<dto::ProductResponseTo> GetPublished();
    std::vector<dto::ProductResponseTo> GetByPriceRange(const std::string& minPrice, const std::string& maxPrice);
    std::vector<dto::ProductResponseTo> GetByTags(const std::vector<std::string>& tagIds);

private:
    dto::ProductResponseTo EnrichWithTags(const Products& product);
    std::vector<dto::ProductResponseTo> EnrichListWithTags(const std::vector<Products>& products);

    std::shared_ptr<ProductRepository> m_productDao;
    std::shared_ptr<TagRepository> m_tagDao;
    std::shared_ptr<ProductTagRepository> m_productTagDao;
};

}