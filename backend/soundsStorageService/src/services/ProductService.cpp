#include <services/ProductService.h>
#include <storage/database/ProductRepository.h>
#include <storage/database/TagRepository.h>
#include <storage/database/ProductTagRepository.h>
#include <mapping/ProductMapper.h>
#include <mapping/TagMapper.h>
#include <exceptions/DatabaseException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/ValidationException.h>

namespace soundwaveSounds
{

using namespace dto;

ProductService::ProductService(
    std::shared_ptr<ProductRepository> productRepository,
    std::shared_ptr<TagRepository> tagRepository,
    std::shared_ptr<ProductTagRepository> productTagRepository)
    : m_productDao(productRepository)
    , m_tagDao(tagRepository)
    , m_productTagDao(productTagRepository)
{
}

ProductResponseTo ProductService::Create(const ProductRequestTo& request)
{
    request.validate();

    auto entity = ProductMapper::ToEntity(request);
    auto result = m_productDao->Create(entity);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to create product");
    }

    auto id = std::get<std::string>(result);

    for (const auto& tagId : request.tagIds)
    {
        auto addResult = m_productTagDao->AddTagToProduct(id, tagId);
        if (std::holds_alternative<DatabaseError>(addResult))
        {
            throw DatabaseException("Failed to add tag to product");
        }
    }

    auto getResult = m_productDao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve created product");
    }

    return EnrichWithTags(std::get<Products>(getResult));
}

ProductResponseTo ProductService::Read(const std::string& id)
{
    auto result = m_productDao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Product not found");
        }
        throw DatabaseException("Failed to retrieve product");
    }

    return EnrichWithTags(std::get<Products>(result));
}

ProductResponseTo ProductService::Update(const ProductRequestTo& request, const std::string& id)
{
    request.validate();

    auto entity = ProductMapper::ToEntityForUpdate(request, id);
    auto updateResult = m_productDao->Update(id, entity);

    if (std::holds_alternative<DatabaseError>(updateResult))
    {
        auto error = std::get<DatabaseError>(updateResult);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Product not found for update");
        }
        throw DatabaseException("Failed to update product");
    }

    auto getResult = m_productDao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve updated product");
    }

    return EnrichWithTags(std::get<Products>(getResult));
}

bool ProductService::Delete(const std::string& id)
{
    auto result = m_productDao->Delete(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Product not found for deletion");
        }
        throw DatabaseException("Failed to delete product");
    }

    return std::get<bool>(result);
}

std::vector<ProductResponseTo> ProductService::GetAll()
{
    auto result = m_productDao->ReadAll();

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve all products");
    }

    return EnrichListWithTags(std::get<std::vector<Products>>(result));
}

std::vector<ProductResponseTo> ProductService::GetByAuthorId(const std::string& authorId)
{
    auto result = m_productDao->FindByAuthorId(authorId);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve products by author ID");
    }

    return EnrichListWithTags(std::get<std::vector<Products>>(result));
}

std::vector<ProductResponseTo> ProductService::GetPublished()
{
    auto result = m_productDao->FindPublished();

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve published products");
    }

    return EnrichListWithTags(std::get<std::vector<Products>>(result));
}

std::vector<ProductResponseTo> ProductService::GetByPriceRange(const std::string& minPrice, const std::string& maxPrice)
{
    auto result = m_productDao->FindByPriceRange(minPrice, maxPrice);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve products by price range");
    }

    return EnrichListWithTags(std::get<std::vector<Products>>(result));
}

std::vector<ProductResponseTo> ProductService::GetByTags(const std::vector<std::string>& tagIds)
{
    std::unordered_set<std::string> productIds;

    for (const auto& tagId : tagIds)
    {
        auto result = m_productTagDao->GetProductsByTagId(tagId);
        if (std::holds_alternative<DatabaseError>(result))
        {
            throw DatabaseException("Failed to retrieve products by tag");
        }
        auto ids = std::get<std::vector<std::string>>(result);
        for (const auto& id : ids)
        {
            productIds.insert(id);
        }
    }

    std::vector<Products> products;
    for (const auto& id : productIds)
    {
        auto result = m_productDao->GetByID(id);
        if (std::holds_alternative<Products>(result))
        {
            products.push_back(std::get<Products>(result));
        }
    }

    return EnrichListWithTags(products);
}

ProductResponseTo ProductService::EnrichWithTags(const Products& product)
{
    auto tagIdsResult = m_productTagDao->GetTagsByProductId(product.getValueOfId());
    std::vector<std::string> tagIds;
    std::vector<std::string> tagNames;

    if (std::holds_alternative<std::vector<std::string>>(tagIdsResult))
    {
        tagIds = std::get<std::vector<std::string>>(tagIdsResult);
        for (const auto& tagId : tagIds)
        {
            auto tagResult = m_tagDao->GetByID(tagId);
            if (std::holds_alternative<Tags>(tagResult))
            {
                tagNames.push_back(std::get<Tags>(tagResult).getValueOfName());
            }
        }
    }

    return ProductMapper::ToResponse(product, tagIds, tagNames);
}

std::vector<ProductResponseTo> ProductService::EnrichListWithTags(const std::vector<Products>& products)
{
    std::vector<ProductResponseTo> result;
    for (const auto& product : products)
    {
        result.push_back(EnrichWithTags(product));
    }
    return result;
}

}