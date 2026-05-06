//
// Created by dmitry on 05.05.2026.
//

#include "CustomerWalletsService.h"
#include <trantor/utils/Logger.h>
#include <regex>

namespace soundwaveCryptoPayment
{

void CustomerWalletsService::ValidateWallet(const std::string& wallet)
{
    if (wallet.empty())
    {
        throw ValidationException("Wallet address cannot be empty");
    }

    if (wallet.length() > 42)
    {
        throw ValidationException("Wallet address exceeds maximum length");
    }

    static const std::regex walletRegex("^(0x)?[0-9a-fA-F]+$");
    if (!std::regex_match(wallet, walletRegex))
    {
        throw ValidationException("Invalid wallet address format");
    }
}

std::variant<std::vector<CustomerWalletResponseTo>, DatabaseError>
    CustomerWalletsService::GetWallets(uint64_t userId)
{
    LOG_DEBUG << "Getting wallets for user: " << userId;

    auto result = m_repository->GetWallets(userId);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto err = std::get<DatabaseError>(result);
        if (err == DatabaseError::DatabaseError)
        {
            LOG_ERROR << "Failed to get wallets for user " << userId;
        }
        return err;
    }

    return std::get<std::vector<CustomerWalletResponseTo>>(result);
}

std::variant<CustomerWalletResponseTo, DatabaseError>
    CustomerWalletsService::AddWallet(const CustomerWalletRequestTo& dto)
{
    LOG_DEBUG << "Adding wallet for user: " << dto.userId;

    ValidateWallet(dto.wallet);

    auto result = m_repository->AddWallet(dto);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto err = std::get<DatabaseError>(result);
        if (err == DatabaseError::DatabaseError)
        {
            LOG_ERROR << "Failed to add wallet for user " << dto.userId;
        }
        return err;
    }

    auto& wallets = std::get<std::vector<CustomerWalletResponseTo>>(result);
    if (wallets.empty())
    {
        return DatabaseError::Unknown;
    }

    return wallets[0];
}

std::variant<bool, DatabaseError>
    CustomerWalletsService::DeleteWallet(const CustomerWalletRequestTo& dto)
{
    LOG_DEBUG << "Deleting wallet for user: " << dto.userId;

    ValidateWallet(dto.wallet);

    auto result = m_repository->DeleteWallet(dto);

    if (std::holds_alternative<DatabaseError>(result))
    {
        auto err = std::get<DatabaseError>(result);
        if (err == DatabaseError::NotFound)
        {
            throw NotFoundException("Wallet not found for user " + std::to_string(dto.userId));
        }
        LOG_ERROR << "Failed to delete wallet for user " << dto.userId;
        return err;
    }

    return true;
}

}
