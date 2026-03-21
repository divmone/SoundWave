#pragma once

#include <memory>
#include <vector>
#include <string>
#include <dto/requests/SaleRequestTo.h>
#include <dto/responses/SaleResponseTo.h>

namespace soundwaveSounds
{

class SaleRepository;
class ProductRepository;

class SaleService
{
public:
    explicit SaleService(
        std::shared_ptr<SaleRepository> saleRepository,
        std::shared_ptr<ProductRepository> productRepository);

    dto::SaleResponseTo Create(const dto::SaleRequestTo& request);
    dto::SaleResponseTo Read(const std::string& id);
    dto::SaleResponseTo Update(const dto::SaleRequestTo& request, const std::string& id);
    bool Delete(const std::string& id);
    std::vector<dto::SaleResponseTo> GetAll();
    std::vector<dto::SaleResponseTo> GetByProductId(const std::string& productId);
    std::vector<dto::SaleResponseTo> GetByBuyerId(const std::string& buyerId);
    std::vector<dto::SaleResponseTo> GetByStatus(const std::string& status);
    std::vector<dto::SaleResponseTo> GetByDateRange(const std::string& startDate, const std::string& endDate);
    std::string GetTotalRevenueByProduct(const std::string& productId);
    std::string GetTotalRevenueByAuthor(const std::string& authorId);

private:
    void IncrementProductDownloadCount(const std::string& productId);

    std::shared_ptr<SaleRepository> m_saleDao;
    std::shared_ptr<ProductRepository> m_productDao;
};

}