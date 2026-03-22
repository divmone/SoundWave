#include <drogon/HttpAppFramework.h>

#include <storage/database/ProductRepository.h>
#include <storage/database/SoundRepository.h>
#include <storage/database/TagRepository.h>
#include <storage/database/SaleRepository.h>
#include <storage/database/ProductTagRepository.h>
#include <storage/filesystem/SoundDataRepository.h>

#include <services/ProductService.h>
#include <services/SoundService.h>
#include <services/TagService.h>
#include <services/SaleService.h>
#include <services/SoundDataService.h>

#include <api/v1.0/controllers/ProductsController.h>

using namespace soundwaveSounds;

int main() 
{
    drogon::app().loadConfigFile("config/app/config.json");
    
    auto productRepo = std::make_shared<ProductRepository>();
    auto soundRepo = std::make_shared<SoundRepository>();
    auto tagRepo = std::make_shared<TagRepository>();
    auto saleRepo = std::make_shared<SaleRepository>();
    auto productTagRepo = std::make_shared<ProductTagRepository>();
    auto soundDataRepo = std::make_shared<SoundDataRepository>();

    auto productService = std::make_unique<ProductService>(productRepo, tagRepo, productTagRepo);
    auto soundService = std::make_unique<SoundService>(soundRepo);
    auto tagService = std::make_unique<TagService>(tagRepo);
    auto saleService = std::make_unique<SaleService>(saleRepo, productRepo);
    auto soundDataService = std::make_unique<SoundDataService>(soundDataRepo);
    
    auto productsController = std::make_shared<ProductsController>(
        std::move(soundDataService),
        std::move(productService),
        std::move(soundService),
        std::move(tagService)
    );

    drogon::app().registerController(productsController);
    drogon::app().run();
    
    return 0;
}