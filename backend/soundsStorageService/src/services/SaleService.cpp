#include <services/SaleService.h>
#include <storage/database/SaleRepository.h>
#include <storage/database/ProductRepository.h>
#include <mapping/SaleMapper.h>
#include <exceptions/DatabaseException.h>
#include <exceptions/NotFoundException.h>

namespace soundwaveSounds
{

using namespace dto;

SaleService::SaleService(
    std::shared_ptr<SaleRepository> saleRepository,
    std::shared_ptr<ProductRepository> productRepository)
    : m_saleDao(saleRepository)
    , m_productDao(productRepository)
{
}

void SaleService::IncrementProductDownloadCount(const std::string& productId)
{
    auto productResult = m_productDao->GetByID(productId);
    if (std::holds_alternative<Products>(productResult))
    {
        auto product = std::get<Products>(productResult);
        auto newCount = product.getValueOfDownloadCount() + 1;
        product.setDownloadCount(newCount);
        m_productDao->Update(productId, product);
    }
}

SaleResponseTo SaleService::Create(const SaleRequestTo& request)
{
    request.validate();

    auto entity = SaleMapper::ToEntity(request);
    auto result = m_saleDao->Create(entity);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to create sale");
    }

    auto id = std::get<std::string>(result);

    IncrementProductDownloadCount(request.productId);

    auto getResult = m_saleDao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve created sale");
    }

    return SaleMapper::ToResponse(std::get<Sales>(getResult));
}

SaleResponseTo SaleService::Read(const std::string& id)
{
    auto result = m_saleDao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Sale not found");
        }
        throw DatabaseException("Failed to retrieve sale");
    }

    return SaleMapper::ToResponse(std::get<Sales>(result));
}

SaleResponseTo SaleService::Update(const SaleRequestTo& request, const std::string& id)
{
    request.validate();

    auto entity = SaleMapper::ToEntityForUpdate(request, id);
    auto updateResult = m_saleDao->Update(id, entity);

    if (std::holds_alternative<DatabaseError>(updateResult))
    {
        auto error = std::get<DatabaseError>(updateResult);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Sale not found for update");
        }
        throw DatabaseException("Failed to update sale");
    }

    auto getResult = m_saleDao->GetByID(id);

    if (std::holds_alternative<DatabaseError>(getResult))
    {
        throw DatabaseException("Failed to retrieve updated sale");
    }

    return SaleMapper::ToResponse(std::get<Sales>(getResult));
}

bool SaleService::Delete(const std::string& id)
{
    auto result = m_saleDao->Delete(id);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto error = std::get<DatabaseError>(result);
        if (error == DatabaseError::NotFound)
        {
            throw NotFoundException("Sale not found for deletion");
        }
        throw DatabaseException("Failed to delete sale");
    }

    return std::get<bool>(result);
}

std::vector<SaleResponseTo> SaleService::GetAll()
{
    auto result = m_saleDao->ReadAll();

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve all sales");
    }

    return SaleMapper::ToResponseList(std::get<std::vector<Sales>>(result));
}

std::vector<SaleResponseTo> SaleService::GetByProductId(const std::string& productId)
{
    auto result = m_saleDao->FindByProductId(productId);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve sales by product ID");
    }

    return SaleMapper::ToResponseList(std::get<std::vector<Sales>>(result));
}

std::vector<SaleResponseTo> SaleService::GetByBuyerId(const std::string& buyerId)
{
    auto result = m_saleDao->FindByBuyerId(buyerId);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve sales by buyer ID");
    }

    return SaleMapper::ToResponseList(std::get<std::vector<Sales>>(result));
}

std::vector<SaleResponseTo> SaleService::GetByStatus(const std::string& status)
{
    auto result = m_saleDao->FindByStatus(status);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve sales by status");
    }

    return SaleMapper::ToResponseList(std::get<std::vector<Sales>>(result));
}

std::vector<SaleResponseTo> SaleService::GetByDateRange(const std::string& startDate, const std::string& endDate)
{
    auto start = ::trantor::Date::fromDbString(startDate);
    auto end = ::trantor::Date::fromDbString(endDate);

    auto result = m_saleDao->FindByDateRange(start, end);

    if (std::holds_alternative<DatabaseError>(result))
    {
        throw DatabaseException("Failed to retrieve sales by date range");
    }

    return SaleMapper::ToResponseList(std::get<std::vector<Sales>>(result));
}

std::string SaleService::GetTotalRevenueByProduct(const std::string& productId)
{
    try
    {
        auto sql = "SELECT SUM(amount::numeric) as total FROM sales WHERE product_id = $1 AND status = 'completed'";
        auto db = drogon::app().getDbClient();
        auto result = db->execSqlSync(sql, productId);
        if (result.empty() || result[0]["total"].isNull())
        {
            return "0.00";
        }
        return result[0]["total"].as<std::string>();
    }
    catch(const std::exception& e)
    {
        throw DatabaseException("Failed to calculate total revenue");
    }
}

std::string SaleService::GetTotalRevenueByAuthor(const std::string& authorId)
{
    try
    {
        auto sql = R"(
            SELECT SUM(s.amount::numeric) as total
            FROM sales s
            JOIN products p ON s.product_id = p.id
            WHERE p.author_id = $1 AND s.status = 'completed'
        )";
        auto db = drogon::app().getDbClient();
        auto result = db->execSqlSync(sql, authorId);
        if (result.empty() || result[0]["total"].isNull())
        {
            return "0.00";
        }
        return result[0]["total"].as<std::string>();
    }
    catch(const std::exception& e)
    {
        throw DatabaseException("Failed to calculate author revenue");
    }
}

}