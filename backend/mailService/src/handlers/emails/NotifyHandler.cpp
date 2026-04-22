//
// Created by divmone on 4/16/2026.
//

#include "NotifyHandler.hpp"

#include <userver/components/component_context.hpp>

shop::handlers::NotifyHandler::NotifyHandler(
    const userver::components::ComponentConfig &config,
    const userver::components::ComponentContext &context)
    : HttpHandlerBase(config, context), sendService_(context.FindComponent<shop::services::SendService>()) {
}

std::string shop::handlers::NotifyHandler::HandleRequestThrow(
    const server::http::HttpRequest &request,
    server::request::RequestContext &context) const {

    const auto& body = request.RequestBody();
    auto json = formats::json::FromString(body);

    const auto type = json["type"].As<std::string>();
    const auto to   = json["to"].As<std::string>();
    const auto name = json["name"].As<std::string>();
    const auto from = "mail@divmone.ru";

    std::string emailId;

    if (type == "track-submitted") {
        const auto id   = json["trackId"].As<std::string>();
        const dto::TrackSubmittedData data{to, from, id, name};
        emailId = sendService_.sendTrackSubmitted(data);
    } else if (type == "track-approved") {
        const auto id   = json["trackId"].As<std::string>();
        const dto::TrackApprovedData data{to, from, id, name};
        emailId = sendService_.sendTrackApproved(data);
    } else if (type == "track-rejected") {
        const auto id   = json["trackId"].As<std::string>();
        const dto::TrackRejectedData data{to, from, id, name, json["reason"].As<std::string>()};
        emailId = sendService_.sendTrackRejected(data);
    } else if (type == "track-purchased") {
        const auto id   = json["trackId"].As<std::string>();
        const dto::TrackPurchasedData data{to, from, id, name, json["amount"].As<std::string>()};
        emailId = sendService_.sendTrackPurchased(data);
    } else if (type == "track-deleted") {
        const auto id   = json["trackId"].As<std::string>();
        const dto::TrackDeletedData data{to, from, id, name, json["reason"].As<std::string>()};
        emailId = sendService_.sendTrackDeleted(data);
    } else if (type == "payment") {
        const dto::PaymentData data{to, from, json["transactionId"].As<std::string>(),
                                    json["amount"].As<std::string>(), json["status"].As<std::string>(), name};
        emailId = sendService_.sendPaymentInfo(data);
    } else {
        throw userver::server::handlers::ClientError(
            userver::server::handlers::ExternalBody{"Unknown type: " + type}
        );
    }

    formats::json::ValueBuilder response;
    response["id"] = emailId;
    return formats::json::ToString(response.ExtractValue());
}