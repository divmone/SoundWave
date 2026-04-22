//
// Created by divmone on 4/22/2026.
//

#ifndef DB_TEST_DTO_HPP
#define DB_TEST_DTO_HPP

namespace shop::dto {

    struct TrackBaseData {
        std::string to;
        std::string from;
        std::string trackId;
        std::string name;
    };

    struct TrackSubmittedData : TrackBaseData {};

    struct TrackApprovedData : TrackBaseData {};

    struct TrackRejectedData : TrackBaseData {
        std::string reason;
    };

    struct TrackPurchasedData : TrackBaseData {
        std::string amount;
    };

    struct TrackDeletedData : TrackBaseData {
        std::string reason;
    };

    struct PaymentData {
        std::string to;
        std::string from;
        std::string transactionId;
        std::string amount;
        std::string status;
        std::string name;
    };

} // namespace shop::dto

#endif //DB_TEST_DTO_HPP