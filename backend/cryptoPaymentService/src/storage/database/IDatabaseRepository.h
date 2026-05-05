// IDatabaseRepository.h
#pragma once

#include <drogon/orm/Mapper.h>
#include <drogon/HttpAppFramework.h>
#include <dao/DAO.h>

namespace soundwaveCryptoPayment
{

template <typename T, typename K, typename E>
class IDatabaseRepository : public DAO<T, K, E>
{
protected:
    drogon::orm::DbClientPtr GetDbClient() const { return drogon::app().getDbClient(); };
    drogon::orm::Mapper<T> Mapper() { return drogon::orm::Mapper<T>(GetDbClient()); };
};

}
