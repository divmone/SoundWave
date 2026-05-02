##output: {{SERVICE_NAME}}.hpp
//
// {{SERVICE_NAME}}.hpp
//

#pragma once

namespace {{SERVICE_NS}} {

class {{SERVICE_NAME}} {
public:
    static constexpr std::string_view kName = "service-{{HANDLER_LOWER}}";

    {{SERVICE_NAME}}(const components::ComponentConfig&, const components::ComponentContext&);

private:

};

}  // namespace {{SERVICE_NS}}
