# soundsGenService

Сервис генерации звуков по текстовому промпту через внешнее API [Suno](https://sunoapi.org). Принимает запросы от пользователя, инициирует генерацию, отслеживает статус и переносит готовый звук в `sounds-service`.

## Стек

- **Язык/фреймворк:** C++17, [userver](https://userver.tech)
- **БД:** PostgreSQL (`soundwaveAiSounds`, таблица `sound_generations`)
- **Внешнее API:** `https://api.sunoapi.org/api/v1/generate`
- **Порт (внутренний):** 8080

## Поток генерации

Генерация в Suno асинхронная — возвращается `taskId`, по которому периодически опрашивается статус.

```
1. Клиент:           POST /generate                  (prompt)
2. Сервис:           POST suno /generate             → taskId
3. Сервис:           INSERT sound_generations(task_id, prompt, status=pending)
4. Сервис → клиент:  taskId

5. Клиент (polling): GET  /generate/task/status/{taskId}
6. Сервис:           GET  suno /record-info?taskId   → status
7. ... повторять, пока status != "complete"

8. Клиент:           POST /generate/add/{taskId}
9. Сервис:           GET  suno /record-info          → JSON со ссылкой на звук
10. Сервис:          POST sounds-service             → soundId
11. Сервис:          UPDATE sound_generations SET response=..., sound_id=..., status=completed
12. Сервис → клиент: soundId

13. Клиент:          GET  /generate/info/{soundId}   → исходный prompt + полный ответ Suno
```

## Эндпоинты

### `POST /generate`

Запускает генерацию.

**Запрос:**
```json
{ "prompt": "lofi chill beat with rain" }
```

**Ответ:** строка `taskId` (от Suno).

> ⚠️ Авторизация **не проверяется** — `// TODO AUTH CHECK` в [GenerateHandler.cpp:22](src/handlers/GenerateHandler.cpp#L22).

### `GET /generate/task/status/{id}`

Возвращает текущий статус задачи в Suno (`pending` / `processing` / `complete` / `failed` и т.д.). Делает прокси-запрос к `sunoapi.org/record-info`.

### `POST /generate/add/{id}`

Где `{id}` — `taskId`. После того как генерация завершилась:

1. Забирает финальный JSON у Suno.
2. Шлёт его в `sounds-service` (`POST http://sound-service:8080`).
3. Сохраняет в БД ссылку (`sound_id`), полный JSON-ответ и переводит запись в `status=completed`.

**Ответ:** `soundId` (UUID звука в `sounds-service`).

### `GET /generate/info/{id}`

Где `{id}` — `soundId`. Возвращает метаданные из БД:

```json
{
  "soundId": "...",
  "prompt":  "исходный промпт",
  "response": "сырой JSON от Suno"
}
```

## Схема БД

Таблица `sound_generations` (миграция [V1__init_schema.sql](../../migrations/aiGenService/V1__init_schema.sql)):

| Поле        | Тип           | Назначение                                  |
|-------------|---------------|---------------------------------------------|
| id          | UUID, PK      | внутренний id записи                        |
| task_id     | TEXT, UNIQUE  | id задачи у Suno                            |
| prompt      | TEXT          | исходный промпт пользователя                |
| status      | VARCHAR(20)   | `pending` / `completed` / ...               |
| sound_id    | UUID, NULL    | id звука в `sounds-service` после `/add`    |
| response    | JSONB, NULL   | сырой ответ Suno                            |
| created_at  | TIMESTAMPTZ   | время создания                              |
| updated_at  | TIMESTAMPTZ   | автообновление триггером `update_updated_at`|

> В коде репозитория ([GenerateRepository.cpp](src/repositories/GenerateRepository.cpp)) есть несоответствие: `INSERT` идёт в `sound_generations`, а `UPDATE`/`SELECT` — в `generation_tasks`. Имя таблицы нужно привести к одному виду (миграция создаёт `sound_generations`).

## Конфигурация

[`configs/static_config.yaml`](configs/static_config.yaml):

- `service-generate.api-key` ← `$suno-api-key` (через `config_vars`/env)
- `postgres-db-1.dbconnection` ← `$DB_CONNECTION` (env)

В `docker-compose.yml` (сервис `generate-service`) пробрасываются:
- `DB_CONNECTION` — строка подключения к `generate-postgres`
- `SUNO_API_KEY` — токен Suno API

## Сборка / запуск

```bash
cd backend/soundsGenService
make cmake-debug
make build-debug
make start-debug
```

В Docker:
```bash
docker compose up --build generate-service
```

## Известные проблемы / TODO

- **Нет авторизации** в `POST /generate` — любой клиент может запустить дорогую генерацию.
- **Несоответствие имени таблицы** между `INSERT` (`sound_generations`) и `UPDATE`/`SELECT` (`generation_tasks`).
- **Хардкод `sound-service:8080`** в [GenerateService.cpp:99](src/services/GenerateService.cpp#L99) — вынести в config.
- **Хардкод callback URL** `soundwave.divmone.ru/generate/callback` в [GenerateService.cpp:31](src/services/GenerateService.cpp#L31) — вынести в config (и реализовать сам callback-эндпоинт, чтобы не делать polling).
- **Таймаут 1 сек** на запрос к `sound-service` в `addGeneratedSound` — слишком жёстко для загрузки аудиофайла.
- Polling-схема (`/status` + `/add`) могла бы быть заменена на callback от Suno (поле `callBackUrl` в запросе уже передаётся).
