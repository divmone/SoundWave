//
// Created by divmone on 4/16/2026.
//

#include "SendService.h"

#include <userver/components/component_config.hpp>
#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/server/handlers/exceptions.hpp>
#include <userver/utils/exception.hpp>
#include <userver/yaml_config/schema.hpp>
#include <userver/yaml_config/merge_schemas.hpp>

shop::services::SendService::SendService(
    const userver::components::ComponentConfig &config,
    const userver::components::ComponentContext &context)
    : ComponentBase(config, context)
      , client_(
          context.FindComponent<components::HttpClient>("http-client").
          GetHttpClient())
      , api_key_("Bearer " + config["api-key"].As<std::string>()) {
}

static std::string makeHtml(const std::string& headerColor,
                             const std::string& emoji,
                             const std::string& title,
                             const std::string& content) {
    return fmt::format(R"(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
    .header {{ background: {}; padding: 32px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 24px; }}
    .body {{ padding: 32px; color: #333; }}
    .body p {{ font-size: 16px; line-height: 1.6; }}
    .badge {{ display: inline-block; background: #f0f0f0; color: #555; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; }}
    .footer {{ background: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #999; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{} {}</h1>
    </div>
    <div class="body">
      {}
    </div>
    <div class="footer">
      &copy; 2026 divmone. All rights reserved.
    </div>
  </div>
</body>
</html>
)", headerColor, emoji, title, content);
}

std::string shop::services::SendService::send(const std::string &to,
                                              const std::string &from,
                                              const std::string &html,
                                              const std::string &subject) {
    formats::json::ValueBuilder json;
    json["to"] = to;
    json["from"] = from;
    json["html"] = html;
    json["subject"] = subject;

    const auto &response = client_.CreateRequest()
            .post("https://api.resend.com/emails")
            .headers({
                {"Authorization", api_key_},
                {"Content-Type", "application/json"}
            })
            .data(userver::formats::json::ToString(json.ExtractValue()))
            .retry(2)
            .timeout(std::chrono::seconds{5})
            .perform();

    auto result = userver::formats::json::FromString(response->body());
    const auto id = result["id"].As<std::string>();
    LOG_INFO() << "Email sent, id=" << id;

    return id;
}

std::string shop::services::SendService::sendTrackSubmitted(
    const shop::dto::TrackSubmittedData &data) {
    const auto content = fmt::format(R"(
      <p>Hi, <b>{}</b>!</p>
      <p>Your track has been successfully submitted for review.</p>
      <p>Track ID: <span class="badge">{}</span></p>
      <p>We'll notify you once it's reviewed. Stay tuned!</p>
)", data.name, data.trackId);

    return send(data.to, data.from,
                makeHtml("#6c47ff", "✅", "Track Submitted", content),
                "Track Submitted");
}

std::string shop::services::SendService::sendTrackApproved(
    const dto::TrackApprovedData &data) {
    const auto content = fmt::format(R"(
      <p>Hi, <b>{}</b>!</p>
      <p>Great news — your track has been <b>approved</b> and is now live!</p>
      <p>Track ID: <span class="badge">{}</span></p>
      <p>Thank you for your contribution. Keep it up! 🎶</p>
)", data.name, data.trackId);

    return send(data.to, data.from,
                makeHtml("#22c55e", "🎉", "Track Approved", content),
                "Track Approved");
}

std::string shop::services::SendService::sendTrackRejected(
    const dto::TrackRejectedData &data) {
    const auto content = fmt::format(R"(
      <p>Hi, <b>{}</b>!</p>
      <p>Unfortunately, your track has been <b>rejected</b>.</p>
      <p>Track ID: <span class="badge">{}</span></p>
      <p>Reason: <b>{}</b></p>
      <p>Please review the feedback and feel free to resubmit.</p>
)", data.name, data.trackId, data.reason);

    return send(data.to, data.from,
                makeHtml("#ef4444", "❌", "Track Rejected", content),
                "Track Rejected");
}

std::string shop::services::SendService::sendTrackPurchased(
    const dto::TrackPurchasedData &data) {
    const auto content = fmt::format(R"(
      <p>Hi, <b>{}</b>!</p>
      <p>Someone just purchased your track. Congrats! 🎊</p>
      <p>Track ID: <span class="badge">{}</span></p>
      <p>Amount: <b>${}</b></p>
)", data.name, data.trackId, data.amount);

    return send(data.to, data.from,
                makeHtml("#f59e0b", "💰", "Track Purchased", content),
                "Track Purchased");
}

std::string shop::services::SendService::sendTrackDeleted(
    const dto::TrackDeletedData &data) {
    const auto content = fmt::format(R"(
      <p>Hi, <b>{}</b>!</p>
      <p>Your track has been <b>deleted</b>.</p>
      <p>Track ID: <span class="badge">{}</span></p>
      <p>Reason: <b>{}</b></p>
      <p>If you have any questions, please contact support.</p>
)", data.name, data.trackId, data.reason);

    return send(data.to, data.from,
                makeHtml("#64748b", "🗑️", "Track Deleted", content),
                "Track Deleted");
}

std::string shop::services::SendService::sendPaymentInfo(
    const dto::PaymentData &data) {
    const auto content = fmt::format(R"(
      <p>Hi, <b>{}</b>!</p>
      <p>Your payment status: <b>{}</b></p>
      <p>Amount: <b>${}</b></p>
      <p>Transaction ID: <span class="badge">{}</span></p>
)", data.name, data.status, data.amount, data.transactionId);

    return send(data.to, data.from,
                makeHtml("#3b82f6", "💳", "Payment " + data.status, content),
                "Payment " + data.status);
}

userver::yaml_config::Schema shop::services::SendService::
GetStaticConfigSchema() {
    return userver::yaml_config::MergeSchemas<
        userver::components::ComponentBase>(R"(
type: object
description: Sendservice config
additionalProperties: false
properties:
    api-key:
        type: string
        description: Api key for Resend
)");
}