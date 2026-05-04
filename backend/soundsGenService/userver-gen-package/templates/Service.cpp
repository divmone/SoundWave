##output: {{SERVICE_NAME}}.cpp
//
// {{SERVICE_NAME}}.cpp
//

#include "{{SERVICE_NAME}}.hpp"

namespace {{SERVICE_NS}} {

{{SERVICE_NAME}}::{{SERVICE_NAME}}(const components::ComponentConfig &config,
                                   const components::ComponentContext &context)
        : ComponentBase(config, context)
{
}

}  // namespace {{SERVICE_NS}}
