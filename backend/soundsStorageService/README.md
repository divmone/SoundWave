## **API Документация — Sound Storage Service**

---

### **Базовый URL**
```
http://localhost:6666/api/v1.0
```

---

### **1. Получить количество звуков**
```
GET /sounds/amount
```

**Пример запроса:**
```bash
curl http://localhost:6666/api/v1.0/sounds/amount
```

**Ответ:**
```json
{
    "amount": 42
}
```

**Коды ответа:**
- `200 OK` — успешно
- `500 Internal Server Error` — ошибка сервера

---

### **2. Получить страницу звуков (пагинация)**
```
GET /sounds/pages/{pageNum}
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `pageNum` | uint64 | Номер страницы (1, 2, 3...), 9 звуков на странице |

**Пример запроса:**
```bash
curl http://localhost:6666/api/v1.0/sounds/pages/1
```

**Ответ:**
```json
[
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "soundId": "660e8400-e29b-41d4-a716-446655440001",
        "authorId": "123",
        "title": "Epic Battle Theme",
        "description": "Intense orchestral track for boss fights",
        "price": "4.99",
        "rating": 4.8,
        "downloadCount": 127,
        "isPublished": true,
        "tagIds": ["tag-uuid-1", "tag-uuid-2"],
        "tagNames": ["epic", "cinematic"],
        "createdAt": "2024-01-15 10:30:00",
        "updatedAt": "2024-01-15 10:30:00"
    }
]
```

**Коды ответа:**
- `200 OK` — успешно
- `404 Not Found` — страница не существует
- `500 Internal Server Error` — ошибка сервера

---

### **3. Получить звук по ID**
```
GET /sounds/{id}
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | uint64 | ID продукта |

**Пример запроса:**
```bash
curl http://localhost:6666/api/v1.0/sounds/1
```

**Ответ:**
```json
{
    "id": "1",
    "soundId": "660e8400-e29b-41d4-a716-446655440001",
    "authorId": "123",
    "title": "Epic Battle Theme",
    "description": "Intense orchestral track for boss fights",
    "price": "4.99",
    "rating": 4.8,
    "downloadCount": 127,
    "isPublished": true,
    "tagIds": ["tag-uuid-1", "tag-uuid-2"],
    "tagNames": ["epic", "cinematic"],
    "createdAt": "2024-01-15 10:30:00",
    "updatedAt": "2024-01-15 10:30:00"
}
```

**Коды ответа:**
- `200 OK` — успешно
- `404 Not Found` — звук не найден
- `500 Internal Server Error` — ошибка сервера

---

### **4. Получить звуки пользователя**
```
GET /sounds/user/{userId}
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `userId` | uint64 | ID пользователя |

**Пример запроса:**
```bash
curl http://localhost:6666/api/v1.0/sounds/user/123
```

**Ответ:** массив звуков (формат как в п.2)

**Коды ответа:**
- `200 OK` — успешно
- `404 Not Found` — пользователь не найден
- `500 Internal Server Error` — ошибка сервера

---

### **5. Загрузить звук**
```
POST /sounds/user/{userId}/upload
Content-Type: multipart/form-data
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `userId` | uint64 | ID пользователя (в URL) |
| `metadata` | JSON string | Метаданные (см. формат ниже) |
| `audio` | file | Аудиофайл (mp3, wav, ogg, m4a, flac, aac) |

**Формат метаданных:**
```json
{
    "title": "Epic Battle Theme",
    "description": "Intense orchestral track for boss fights",
    "price": "4.99",
    "tags": ["epic", "cinematic", "battle"],
    "originalName": "epic_battle_theme.mp3",
    "mimeType": "audio/mpeg",
    "durationSeconds": 180
}
```

**Пример curl запроса:**
```bash
curl -X POST http://localhost:6666/api/v1.0/sounds/user/123/upload \
  -F "metadata={\"title\":\"Epic Battle Theme\",\"description\":\"Intense orchestral track\",\"price\":\"4.99\",\"tags\":[\"epic\",\"cinematic\"],\"originalName\":\"epic_battle.mp3\",\"mimeType\":\"audio/mpeg\",\"durationSeconds\":180}" \
  -F "audio=@/path/to/epic_battle.mp3"
```

**Успешный ответ (200 OK):**
```json
{
    "message": "Sound uploaded successfully",
    "productId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Ошибки:**
| Код | Причина |
|-----|---------|
| `400 Bad Request` | Нет файла, нет метаданных, неверный JSON, неверное расширение файла |
| `404 Not Found` | Тег не найден (если указан в tags) |
| `500 Internal Server Error` | Ошибка сохранения файла или БД |

---

### **6. Удалить звук**
```
DELETE /sounds/{id}
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | uint64 | ID звука |

**Пример запроса:**
```bash
curl -X DELETE http://localhost:6666/api/v1.0/sounds/1
```

**Ответ:**
- `204 No Content` — успешно удалено
- `404 Not Found` — звук не найден
- `400 Bad Request` — неверный запрос
- `500 Internal Server Error` — ошибка сервера

---

### **7. Получить аудиофайл**
```
GET /sounds/{id}/data
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | uint64 | ID продукта |

**Пример запроса:**
```bash
curl http://localhost:6666/api/v1.0/sounds/1/data --output sound.mp3
```

**Ответ:**
- Бинарные данные аудиофайла
- Заголовки: `Content-Type: audio/mpeg`, `Accept-Ranges: bytes`

**Коды ответа:**
- `200 OK` — файл найден и отправлен
- `404 Not Found` — звук или файл не найден
- `500 Internal Server Error` — ошибка сервера

---

### **8. Редактировать звук**
```
PUT /sounds/{id}
```

⚠️ **Не реализовано** (пока)

---

## **Схема данных**

### **ProductResponseTo (ответ)**
| Поле | Тип | Описание |
|------|-----|----------|
| `id` | string | UUID продукта |
| `soundId` | string | UUID звукового файла |
| `authorId` | string | ID автора |
| `title` | string | Название |
| `description` | string | Описание |
| `price` | string | Цена (DECIMAL) |
| `rating` | double | Рейтинг (0.00–5.00) |
| `downloadCount` | int64 | Количество скачиваний |
| `isPublished` | bool | Опубликован ли |
| `tagIds` | array | UUID тегов |
| `tagNames` | array | Имена тегов |
| `createdAt` | string | Дата создания |
| `updatedAt` | string | Дата обновления |

---

## **Рекомендации**

1. **Пагинация:** страницы нумеруются с 1, размер страницы = 9
2. **Загрузка:** метаданные передаются как JSON-строка в поле `metadata`
3. **Теги:** если тег не существует — вернется 404, нужно создавать теги заранее или доработать логику
4. **Аудиоформаты:** разрешены `mp3`, `wav`, `ogg`, `m4a`, `flac`, `aac`