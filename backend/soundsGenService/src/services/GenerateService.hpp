//
// Created by divmone on 4/30/2026.
//

#pragma once

#include <userver/components/component_base.hpp>
#include <userver/clients/http/client.hpp>

#include "repositories/GenerateRepository.hpp"

using namespace userver;

namespace shop::services {
    class GenerateService final: public components::ComponentBase{
    public:
        static constexpr std::string_view kName = "service-generate";
        GenerateService(const components::ComponentConfig&, const components::ComponentContext&);

        std::string generateSound(const std::string &);

        std::string getTaskStatus(const std::string &) const;
        std::string getTaskInfo(const std::string &) const;

        std::string addGeneratedSound(const std::string&taskId, const std::string &token);
        static yaml_config::Schema GetStaticConfigSchema();

        GeneratedSoundInfo getInfoBySoundId(const std::string &);
        std::string getIdByToken(const std::string& token) const;

    private:
        repositories::GenerateRepository& repository_;
        clients::http::Client& httpClient;
        std::string apiKey;
        std::string auth_url_;
        std::string sounds_url_;
    };
}

