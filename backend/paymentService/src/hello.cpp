#include <hello.hpp>

#include <greeting.hpp>

namespace paymentService {

std::string
Hello::HandleRequestThrow(const userver::server::http::HttpRequest& request, userver::server::request::RequestContext&)
    const {
    return SayHelloTo(request.GetArg("name"), UserType::kFirstTime);
}

}  // namespace paymentService