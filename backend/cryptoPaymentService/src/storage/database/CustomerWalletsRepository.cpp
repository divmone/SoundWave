//
// Created by dmitry on 05.05.2026.
//

#include "CustomerWalletsRepository.h"
#include <mapping/CustomerWalletsMapper.h>
#include <drogon/orm/Criteria.h>

using namespace drogon;
using namespace drogon::orm;
using namespace drogon_model::soundwaveCryptoPayment;

namespace soundwaveCryptoPayment
{
    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError>
        CustomerWalletsRepository::AddWallet(CustomerWalletRequestTo dto)
    {
        try
        {
            auto entity = toEntity(dto);
            Mapper().insert(entity);

            CustomerWalletResponseTo response;
            response.userId = dto.userId;
            response.wallet = dto.wallet;

            return std::vector<CustomerWalletResponseTo>{response};
        }
        catch (const std::exception& e)
        {
            LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
            return DatabaseError::DatabaseError;
        }
    }

    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError>
        CustomerWalletsRepository::GetWallets(uint64_t userId)
    {
        try
        {
            auto wallets = Mapper().findBy
            (
                Criteria
                (
                    CustomerWallets::Cols::_user_id, CompareOperator::EQ, static_cast<int64_t>(userId)
                )
            );

            std::vector<CustomerWalletResponseTo> result;
            for (const auto& w : wallets)
            {
                result.push_back(toResponse(w));
            }

            return result;
        }
        catch (const std::exception& e)
        {
            LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
            return DatabaseError::DatabaseError;
        }
    }

    std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError>
        CustomerWalletsRepository::DeleteWallet(CustomerWalletRequestTo dto)
    {
        try
        {
            auto count = Mapper().deleteBy
            (
                Criteria
                (
                    CustomerWallets::Cols::_user_id, CompareOperator::EQ, static_cast<int64_t>(dto.userId)
                )
                &&
                Criteria
                (
                    CustomerWallets::Cols::_wallet, CompareOperator::EQ, dto.wallet
                )
            );

            if (count == 0)
            {
                return DatabaseError::NotFound;
            }

            return std::vector<CustomerWalletResponseTo>{};
        }
        catch (const std::exception& e)
        {
            LOG_INFO << __FILE__ << __LINE__ << "Exception thrown " << std::string(e.what());
            return DatabaseError::DatabaseError;
        }
    }
}