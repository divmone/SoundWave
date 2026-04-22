//
// Created by divmone on 4/16/2026.
//

#ifndef DB_TEST_SENDSERVICE_H
#define DB_TEST_SENDSERVICE_H

#include <userver/components/component_base.hpp>
#include <userver/clients/http/client.hpp>

#include "dto/dto.hpp"

namespace shop::services {
    using namespace userver;

    class SendService final : public services::components::ComponentBase {
    public:
        struct TrackSubmittedData {
            std::string to;
            std::string from;
            std::string trackId;
            std::string name;
        };

        static constexpr std::string_view kName = "service-send";
        SendService(const userver::components::ComponentConfig& config,
            const userver::components::ComponentContext& context);

        std::string send(const std::string &to, const std::string &from,
                         const std::string &html,
                         const std::string &subject);

        std::string sendTrackSubmitted(const dto::TrackSubmittedData& data);
        std::string sendTrackApproved(const dto::TrackApprovedData& data);
        std::string sendTrackRejected(const dto::TrackRejectedData& data);
        std::string sendTrackPurchased(const dto::TrackPurchasedData& data);
        std::string sendTrackDeleted(const dto::TrackDeletedData& data);
        std::string sendPaymentInfo(const dto::PaymentData& data);

        static yaml_config::Schema GetStaticConfigSchema();
    private:
        clients::http::Client& client_;
        std::string api_key_;
    };
}


#endif //DB_TEST_SENDSERVICE_H
