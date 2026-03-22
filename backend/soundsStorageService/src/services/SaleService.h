// SaleService.h
#pragma once

#include <memory>
#include <vector>
#include <string>
#include <cstdint>
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
    dto::SaleResponseTo Read(uint64_t id);
    dto::SaleResponseTo Update(const dto::SaleRequestTo& request, uint64_t id);
    bool Delete(uint64_t id);
    std::vector<dto::SaleResponseTo> GetAll();
    std::vector<dto::SaleResponseTo> GetByProductId(uint64_t productId);
    std::vector<dto::SaleResponseTo> GetByBuyerId(uint64_t buyerId);
    std::vector<dto::SaleResponseTo> GetByStatus(const std::string& status);
    std::vector<dto::SaleResponseTo> GetByDateRange(const std::string& startDate, const std::string& endDate);
    std::string GetTotalRevenueByProduct(uint64_t productId);
    std::string GetTotalRevenueByAuthor(uint64_t authorId);

private:
    void IncrementProductDownloadCount(uint64_t productId);

    std::shared_ptr<SaleRepository> m_saleDao;
    std::shared_ptr<ProductRepository> m_productDao;
};

}