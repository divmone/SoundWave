#include "ProductsController.h"
#include <exceptions/DatabaseException.h>
#include <exceptions/NotFoundException.h>
#include <exceptions/ValidationException.h>

soundwaveSounds::ProductsController::ProductsController(std::unique_ptr<SoundDataService> soundDataService,
                                                        std::unique_ptr<ProductService> productService, 
                                                        std::unique_ptr<SoundService> soundService, 
                                                        std::unique_ptr<TagService> tagService)
{
    m_soundDataService = std::move(soundDataService);
    m_productService = std::move(productService);
    m_soundService = std::move(soundService);
    m_tagService = std::move(tagService);
}

void soundwaveSounds::ProductsController::GetSoundsAmount(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) 
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto amount = m_productService->GetAmount();
        Json::Value jsonResponse;
        jsonResponse["amount"] = amount;
        
        std::string responseBody = Json::FastWriter().write(jsonResponse); 
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setBody(responseBody);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch(const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);   
    }
    
    callback(httpResponse);
}

void soundwaveSounds::ProductsController::GetPageOfSounds(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t pageNum)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto dtos = m_productService->GetSoundsPage(pageNum);
        Json::Value jsonResponse(Json::arrayValue); 

        for (auto& dto: dtos)
        {
            jsonResponse.append(dto.toJson());
        }
        
        std::string responseBody = Json::FastWriter().write(jsonResponse);  
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setBody(responseBody);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch(const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);   
    }
    catch(const NotFoundException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }
    
    callback(httpResponse);
}

void soundwaveSounds::ProductsController::GetSound(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto dto = m_productService->Read(std::to_string(id));
        Json::Value jsonResponse = dto.toJson();

        std::string responseBody = Json::FastWriter().write(jsonResponse); 
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setBody(responseBody);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch(const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);   
    }
    catch(const NotFoundException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }
    
    callback(httpResponse);
}

void soundwaveSounds::ProductsController::GetUserSounds(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t userId)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto dtos = m_productService->GetByAuthorId(std::to_string(userId));
        Json::Value jsonResponse(Json::arrayValue); 

        for (auto& dto: dtos)
        {
            jsonResponse.append(dto.toJson());
        }
        
        std::string responseBody = Json::FastWriter().write(jsonResponse);  
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setBody(responseBody);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch(const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);   
    }
    catch(const NotFoundException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }
    
    callback(httpResponse);
}

void soundwaveSounds::ProductsController::UploadSound(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t userId)
{
    Json::Value responseJson;
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        MultiPartParser parser;
        parser.parse(req);

        if (parser.getFiles().empty())
        {
            responseJson["message"] = "No audio file provided";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        // Получаем метаданные из параметров
        auto& params = parser.getParameters();
        auto it = params.find("metadata");
        if (it == params.end() || it->second.empty())
        {
            responseJson["message"] = "Metadata is required";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        std::string metadataJson = it->second;
        Json::Value metadata;
        Json::Reader reader;
        if (!reader.parse(metadataJson, metadata))
        {
            responseJson["message"] = "Invalid metadata JSON format";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        // Проверяем обязательные поля
        if (!metadata.isMember("title") || metadata["title"].asString().empty())
        {
            responseJson["message"] = "Title is required";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        if (!metadata.isMember("price") || metadata["price"].asString().empty())
        {
            responseJson["message"] = "Price is required";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        HttpFile audioFile = parser.getFiles()[0];
        std::string extension(audioFile.getFileExtension());

        // Проверяем расширение
        if (extension.empty())
        {
            responseJson["message"] = "File has no extension";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        // Создаем Sound
        dto::SoundRequestTo soundRequest;
        soundRequest.userId = std::to_string(userId);
        soundRequest.filename = ""; // будет заполнено после создания
        soundRequest.originalName = metadata.get("originalName", audioFile.getFileName()).asString();
        soundRequest.filePath = ""; // будет заполнено после создания
        soundRequest.fileSize = audioFile.fileLength();
        soundRequest.mimeType = metadata.get("mimeType", "audio/mpeg").asString();
        soundRequest.durationSeconds = metadata.get("durationSeconds", 0).asInt();

        dto::SoundResponseTo soundResponse = m_soundService->Create(soundRequest);

        // Сохраняем файл
        if (!m_soundDataService->SaveSoundFile(audioFile, std::stoull(soundResponse.id), userId))
        {
            responseJson["message"] = "Failed to save audio file";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
            callback(httpResponse);
            return;
        }

        // Обновляем Sound с правильными filename и filePath
        dto::SoundRequestTo updateRequest;
        updateRequest.id = soundResponse.id;
        updateRequest.userId = std::to_string(userId);
        updateRequest.filename = soundResponse.id + "." + extension;
        updateRequest.originalName = soundRequest.originalName;
        updateRequest.filePath = "storage/sounds/user_" + std::to_string(userId) + "/" + updateRequest.filename;
        updateRequest.fileSize = soundRequest.fileSize;
        updateRequest.mimeType = soundRequest.mimeType;
        updateRequest.durationSeconds = soundRequest.durationSeconds;

        m_soundService->Update(updateRequest, soundResponse.id);

        // Создаем Product
        dto::ProductRequestTo productRequest;
        productRequest.soundId = soundResponse.id;
        productRequest.authorId = std::to_string(userId);
        productRequest.title = metadata["title"].asString();
        productRequest.description = metadata.get("description", "").asString();
        productRequest.price = metadata["price"].asString();

        // Обрабатываем теги
        if (metadata.isMember("tags") && metadata["tags"].isArray())
        {
            for (const auto& tagName : metadata["tags"])
            {
                try
                {
                    auto tagResult = m_tagService->GetByName(tagName.asString());
                    productRequest.tagIds.push_back(tagResult.id);
                }
                catch (const NotFoundException&)
                {
                    // Тег не найден, создаем новый
                    dto::TagRequestTo tagRequest;
                    tagRequest.name = tagName.asString();
                    auto newTag = m_tagService->Create(tagRequest);
                    productRequest.tagIds.push_back(newTag.id);
                }
            }
        }

        dto::ProductResponseTo product = m_productService->Create(productRequest);

        responseJson["message"] = "Sound uploaded successfully";
        responseJson["productId"] = product.id;
        responseJson["soundId"] = soundResponse.id;

        httpResponse->setBody(Json::FastWriter().write(responseJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const ValidationException& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(responseJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }
    catch (const NotFoundException& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(responseJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }
    catch (const DatabaseException& e)
    {
        responseJson["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(responseJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }
    catch (const std::exception& e)
    {
        responseJson["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(responseJson));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }

    callback(httpResponse);
}

void soundwaveSounds::ProductsController::EditSound(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    // Не надо пока
}

void soundwaveSounds::ProductsController::DeleteSound(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {           
        if (m_soundService->Delete(std::to_string(id)))
        {
            httpResponse->setStatusCode(HttpStatusCode::k204NoContent);
        }
        else
        {
            Json::Value errorResponse;
            errorResponse["message"] = "Sound not found";
            httpResponse->setBody(Json::FastWriter().write(errorResponse));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
        }
    }
    catch(const ValidationException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
    }
    catch(const NotFoundException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }
    catch(const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Database error occurred";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }
    catch(const std::exception& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);    
    }
    
    callback(httpResponse);
}

void soundwaveSounds::ProductsController::GetSoundData(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {
        auto product = m_productService->Read(std::to_string(id));
        auto sound = m_soundService->Read(product.soundId);

        std::vector<char> fileData;
        std::string extension = sound.filename.substr(sound.filename.find_last_of('.') + 1);

        if (!m_soundDataService->GetSoundFile(fileData, std::stoull(sound.id), std::stoull(sound.userId), extension))
        {
            Json::Value errorResponse;
            errorResponse["message"] = "Audio file not found";
            httpResponse->setBody(Json::FastWriter().write(errorResponse));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
            callback(httpResponse);
            return;
        }

        httpResponse->setBody(std::string(fileData.begin(), fileData.end()));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_OCTET_STREAM);
        httpResponse->addHeader("Content-Type", sound.mimeType);
        httpResponse->addHeader("Content-Length", std::to_string(fileData.size()));
        httpResponse->addHeader("Accept-Ranges", "bytes");
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch (const NotFoundException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
    }
    catch (const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error";
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }
    catch (const std::exception& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = e.what();
        httpResponse->setBody(Json::FastWriter().write(errorResponse));
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
    }

    callback(httpResponse);
}