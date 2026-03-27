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
        errorResponse["message"] = "Internal server error: " + std::string(e.what());
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
        errorResponse["message"] = "Internal server error: " + std::string(e.what());
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
        auto dto = m_productService->Read(id);
        Json::Value jsonResponse = dto.toJson();

        std::string responseBody = Json::FastWriter().write(jsonResponse); 
        httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
        httpResponse->setBody(responseBody);
        httpResponse->setStatusCode(HttpStatusCode::k200OK);
    }
    catch(const DatabaseException& e)
    {
        Json::Value errorResponse;
        errorResponse["message"] = "Internal server error: " + std::string(e.what());
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
        auto dtos = m_productService->GetByAuthorId(userId);
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
        errorResponse["message"] = "Internal server error: " + std::string(e.what());
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

        if (extension.empty())
        {
            responseJson["message"] = "File has no extension";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(httpResponse);
            return;
        }

        dto::SoundRequestTo soundRequest;
        soundRequest.userId = userId;
        soundRequest.filename = "";
        soundRequest.originalName = metadata.get("originalName", audioFile.getFileName()).asString();
        soundRequest.filePath = "";
        soundRequest.fileSize = audioFile.fileLength();
        soundRequest.mimeType = metadata.get("mimeType", "audio/mpeg").asString();
        soundRequest.durationSeconds = metadata.get("durationSeconds", 0).asInt();

        dto::SoundResponseTo soundResponse = m_soundService->Create(soundRequest);

        auto& fileId = soundResponse.id;

        if (!m_soundDataService->SaveSoundFile(audioFile, fileId, userId))
        {
            responseJson["message"] = "Failed to save audio file";
            httpResponse->setBody(Json::FastWriter().write(responseJson));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k500InternalServerError);
            callback(httpResponse);
            return;
        }

        dto::SoundRequestTo updateRequest;
        updateRequest.id = soundResponse.id;
        updateRequest.userId = userId;
        updateRequest.filename = std::to_string(soundResponse.id) + "." + extension;
        updateRequest.originalName = soundRequest.originalName;
        updateRequest.filePath = m_soundDataService->GetSoundFilePath(fileId, userId, extension);
        updateRequest.fileSize = soundRequest.fileSize;
        updateRequest.mimeType = soundRequest.mimeType;
        updateRequest.durationSeconds = soundRequest.durationSeconds;

        m_soundService->Update(updateRequest, fileId);

        dto::ProductRequestTo productRequest;
        productRequest.soundId = fileId;
        productRequest.authorId = userId;
        productRequest.title = metadata["title"].asString();
        productRequest.description = metadata.get("description", "").asString();
        productRequest.price = metadata["price"].asString();

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
        responseJson["message"] = "Internal server error: " + std::string(e.what());
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

    fflush(stdout);
    callback(httpResponse);
}

void soundwaveSounds::ProductsController::EditSound(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
}

void soundwaveSounds::ProductsController::DeleteSound(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, uint64_t id)
{
    HttpResponsePtr httpResponse = HttpResponse::newHttpResponse();

    try
    {           
        if (m_soundService->Delete(id))
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
        auto product = m_productService->Read(id);
        auto sound = m_soundService->Read(product.soundId);

        std::vector<char> fileData;
        std::string extension = sound.filename.substr(sound.filename.find_last_of('.') + 1);

        if (!m_soundDataService->GetSoundFile(fileData, sound.id, sound.userId, extension))
        {
            Json::Value errorResponse;
            errorResponse["message"] = "Audio file not found";
            httpResponse->setBody(Json::FastWriter().write(errorResponse));
            httpResponse->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
            httpResponse->setStatusCode(HttpStatusCode::k404NotFound);
            callback(httpResponse);
            return;
        }

        const std::string fullBody(fileData.begin(), fileData.end());
        const size_t totalSize = fullBody.size();

        // Убираем CORS — nginx выставляет его сам
        // Правильно задаём Content-Type через setContentTypeString, а не addHeader
        httpResponse->setContentTypeString(sound.mimeType.empty() ? "audio/mpeg" : sound.mimeType);
        httpResponse->addHeader("Accept-Ranges", "bytes");

        // Поддержка Range-запросов (Safari требует 206 для воспроизведения)
        const std::string rangeHeader = req->getHeader("Range");
        if (!rangeHeader.empty() && rangeHeader.substr(0, 6) == "bytes=")
        {
            size_t dashPos = rangeHeader.find('-', 6);
            size_t start = std::stoull(rangeHeader.substr(6, dashPos - 6));
            size_t end = (dashPos + 1 < rangeHeader.size() && rangeHeader[dashPos + 1] != '\0' && !std::string(rangeHeader.substr(dashPos + 1)).empty())
                ? std::stoull(rangeHeader.substr(dashPos + 1))
                : totalSize - 1;
            if (end >= totalSize) end = totalSize - 1;

            httpResponse->setBody(fullBody.substr(start, end - start + 1));
            httpResponse->addHeader("Content-Range",
                "bytes " + std::to_string(start) + "-" + std::to_string(end) + "/" + std::to_string(totalSize));
            httpResponse->addHeader("Content-Length", std::to_string(end - start + 1));
            httpResponse->setStatusCode(HttpStatusCode::k206PartialContent);
        }
        else
        {
            httpResponse->setBody(fullBody);
            httpResponse->addHeader("Content-Length", std::to_string(totalSize));
            httpResponse->setStatusCode(HttpStatusCode::k200OK);
        }
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