#include <drogon/HttpAppFramework.h>
#include <cstdlib>

#include <storage/database/ProductRepository.h>
#include <storage/database/SoundRepository.h>
#include <storage/database/TagRepository.h>
#include <storage/database/ProductTagRepository.h>
#include <storage/filesystem/SoundDataRepository.h>

#include <services/ProductService.h>
#include <services/SoundService.h>
#include <services/TagService.h>
#include <services/SoundDataService.h>

#include <api/v1.0/controllers/ProductsController.h>
#include <api/v1.0/controllers/TagsController.h>

#include <exceptions/GlobalHandler.h>

#include "middleware/GoogleAuthCheckMiddleware.h"

using namespace soundwaveSounds;

int main() 
{
    drogon::app().loadConfigFile("config/app/config.json");

    /// БОЛЬШОЙ БАН БАН БАН
        drogon::app().setExceptionHandler(GlobalExceptionHandler);
    /// НЕ ДЕЛАТЬ ТАК БОЛЬШЕ В ЖИЗНИ

    //drogon::app().registerMiddleware<GoogleAuthCheckMiddleware>(std::make_shared<GoogleAuthCheckMiddleware>());

    auto productRepo = std::make_shared<ProductRepository>();
    auto soundRepo = std::make_shared<SoundRepository>();
    auto tagRepo = std::make_shared<TagRepository>();
    auto productTagRepo = std::make_shared<ProductTagRepository>();
    const char* storagePath = std::getenv("STORAGE_PATH");
    auto soundDataRepo = std::make_shared<SoundDataRepository>(
        storagePath ? storagePath : "./storage/sounds"
    );

    auto productService = std::make_shared<ProductService>(productRepo, tagRepo, productTagRepo);
    auto soundService = std::make_shared<SoundService>(soundRepo);
    auto tagService = std::make_shared<TagService>(tagRepo);
    auto soundDataService = std::make_shared<SoundDataService>(soundDataRepo);

    auto productsController = std::make_shared<ProductsController>(
        soundDataService,
        productService,
        soundService,
        tagService
    );

    auto tagsController = std::make_shared<TagsController>(tagService);

    drogon::app().registerController(productsController);
    drogon::app().registerController(tagsController);
    drogon::app().run();
    
    return 0;
}