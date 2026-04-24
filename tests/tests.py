import json
import urllib.request
import urllib.error
import sys
import time
import io

BASE_URL = "http://localhost:80/api/v1.0"

RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
GREEN  = "\033[32m"
RED    = "\033[31m"
YELLOW = "\033[33m"
CYAN   = "\033[36m"
WHITE  = "\033[97m"
BG_DARK = "\033[48;5;235m"

passed = 0
failed = 0
current_group = ""

def header(title):
    global current_group
    current_group = title
    print(f"\n{CYAN}{BOLD}  ┌─ {title}{RESET}")

def ok(name):
    global passed
    passed += 1
    print(f"{GREEN}  │  ✓ {RESET}{name}")

def fail(name, reason=""):
    global failed
    failed += 1
    suffix = f"{DIM} — {reason}{RESET}" if reason else ""
    print(f"{RED}  │  ✗ {RESET}{name}{suffix}")

def fetch(url, expected_status=200):
    try:
        req = urllib.request.Request(f"{BASE_URL}{url}")
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            return resp.status, body
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode())
        except Exception:
            body = None
        return e.code, body
    except Exception as e:
        return None, None

def assert_ok(name, condition, reason=""):
    if condition:
        ok(name)
    else:
        fail(name, reason)


def upload_sound(user_id, title, description="Test sound", price="0.99",
                 duration=5, tags=None):
    """Upload a minimal valid audio file via multipart/form-data."""
    if tags is None:
        tags = []

    metadata = json.dumps({
        "title": title,
        "description": description,
        "price": price,
        "tags": tags,
        "originalName": "test.mp3",
        "mimeType": "audio/mpeg",
        "durationSeconds": duration,
    })

    # Minimal valid MP3: ID3v2 header + one silent MPEG frame
    # ID3v2.3 header (10 bytes, size=0)
    id3_header = b"ID3\x03\x00\x00\x00\x00\x00\x00"
    # MPEG1 Layer3 128kbps 44100Hz stereo silent frame (417 bytes)
    # Frame header: 0xFF 0xFB 0x90 0x00, rest zeroed
    mpeg_frame = b"\xff\xfb\x90\x00" + b"\x00" * 413
    audio_bytes = id3_header + mpeg_frame

    boundary = "----TestBoundary7MA4YWxkTrZu0gW"
    body = b""

    # metadata part
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="metadata"\r\n\r\n'
    body += metadata.encode() + b"\r\n"

    # audio part
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="audio"; filename="test.mp3"\r\n'
    body += b"Content-Type: audio/mpeg\r\n\r\n"
    body += audio_bytes + b"\r\n"

    body += f"--{boundary}--\r\n".encode()

    url = f"{BASE_URL}/sounds/user/{user_id}/upload"
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            return resp.status, result
    except urllib.error.HTTPError as e:
        try:
            result = json.loads(e.read().decode())
        except Exception:
            result = None
        return e.code, result
    except Exception as ex:
        return None, str(ex)


# ─────────────────────────────────────────────
# ПОДГОТОВКА: загрузка двух тестовых звуков
# ─────────────────────────────────────────────
FIXTURE_USER_ID = 123

print(f"\n{YELLOW}{BOLD}  ◆ Подготовка тестовых данных{RESET}")

uploaded_ids = []
fixtures = [
    ("Test Sound Alpha", "Первый тестовый звук"),
    ("Test Sound Beta",  "Второй тестовый звук"),
]

for title, desc in fixtures:
    status, data = upload_sound(FIXTURE_USER_ID, title, desc)
    if status == 200 and isinstance(data, dict) and "productId" in data:
        pid = data["productId"]
        uploaded_ids.append(pid)
        print(f"{GREEN}  ✓ {RESET}Загружен «{title}»  {DIM}→ productId={pid}{RESET}")
    else:
        reason = data if isinstance(data, str) else (data or f"статус {status}")
        print(f"{RED}  ✗ {RESET}Не удалось загрузить «{title}»  {DIM}— {reason}{RESET}")

print()


# ─────────────────────────────────────────────
# GET /sounds/amount
# ─────────────────────────────────────────────
header("GET /sounds/amount")
status, data = fetch("/sounds/amount")

assert_ok("Статус 200",              status == 200,          f"получен {status}")
assert_ok("Есть поле amount",        isinstance(data, dict) and "amount" in data)
assert_ok("amount — число",          isinstance(data, dict) and isinstance(data.get("amount"), (int, float)))
assert_ok("amount >= 0",             isinstance(data, dict) and data.get("amount", -1) >= 0,
          f"amount = {data.get('amount') if data else '?'}")


# ─────────────────────────────────────────────
# GET /sounds/pages/1
# ─────────────────────────────────────────────
header("GET /sounds/pages/1")
status, data = fetch("/sounds/pages/1")

assert_ok("Статус 200",              status == 200,          f"получен {status}")
assert_ok("Ответ — массив",          isinstance(data, list))
assert_ok("Не более 12 элементов",   isinstance(data, list) and len(data) <= 12,
          f"получено {len(data) if isinstance(data, list) else '?'}")

if isinstance(data, list) and len(data) > 0:
    item = data[0]
    required = ["id", "title", "price", "rating", "authorId", "isPublished"]
    for field in required:
        assert_ok(f"Поле '{field}' присутствует", field in item, f"отсутствует в первом элементе")
    assert_ok("rating в диапазоне 0–5 (все элементы)",
              all(0 <= i.get("rating", -1) <= 5 for i in data),
              "у одного или нескольких элементов rating вне диапазона")
else:
    fail("Список не пуст (нет данных для проверки полей)", "массив пуст или некорректен")


# ─────────────────────────────────────────────
# GET /sounds/pages/9992  →  404
# ─────────────────────────────────────────────
header("GET /sounds/pages/9992  (несуществующая страница)")
status, data = fetch("/sounds/pages/9992")

assert_ok("Статус 404",              status == 404,          f"получен {status}")


# ─────────────────────────────────────────────
# GET /sounds/2
# ─────────────────────────────────────────────
header("GET /sounds/2")
status, data = fetch("/sounds/2")

assert_ok("Статус 200",              status == 200,          f"получен {status}")

if isinstance(data, dict):
    required_fields = [
        "id", "soundId", "authorId", "title", "description",
        "price", "rating", "downloadCount", "isPublished",
        "tagIds", "tagNames", "createdAt", "updatedAt"
    ]
    for field in required_fields:
        assert_ok(f"Поле '{field}' присутствует", field in data)

    assert_ok("rating в диапазоне 0–5",
              0 <= data.get("rating", -1) <= 5,
              f"rating = {data.get('rating')}")
    assert_ok("isPublished — boolean",
              isinstance(data.get("isPublished"), bool),
              f"тип: {type(data.get('isPublished')).__name__}")
    assert_ok("tagIds — массив",
              isinstance(data.get("tagIds"), list))
    assert_ok("tagNames — массив",
              isinstance(data.get("tagNames"), list))
else:
    fail("Тело ответа — объект", "получен не словарь")


# ─────────────────────────────────────────────
# GET /sounds/999  →  404
# ─────────────────────────────────────────────
header("GET /sounds/999  (несуществующий звук)")
status, data = fetch("/sounds/999")

assert_ok("Статус 404",              status == 404,          f"получен {status}")


# ─────────────────────────────────────────────
# GET /sounds/user/123
# ─────────────────────────────────────────────
header("GET /sounds/user/123")
status, data = fetch("/sounds/user/123")

assert_ok("Статус 200",              status == 200,          f"получен {status}")
assert_ok("Ответ — массив",          isinstance(data, list))

if isinstance(data, list):
    wrong = [i for i in data if i.get("authorId") != 123]
    assert_ok("Все элементы принадлежат пользователю 123",
              len(wrong) == 0,
              f"{len(wrong)} элемент(ов) с другим authorId")


# ─────────────────────────────────────────────
# GET /sounds/user/999  (пользователь без звуков)
# ─────────────────────────────────────────────
header("GET /sounds/user/999  (пользователь без звуков)")
status, data = fetch("/sounds/user/999")

assert_ok("Статус 200",              status == 200,          f"получен {status}")
assert_ok("Ответ — массив",          isinstance(data, list))


# ─────────────────────────────────────────────
# ИТОГ
# ─────────────────────────────────────────────
total = passed + failed
bar_width = 36
filled = round(bar_width * passed / total) if total else 0
bar = f"{GREEN}{'█' * filled}{RED}{'░' * (bar_width - filled)}{RESET}"

print(f"\n  {'─' * 44}")
print(f"  {bar}  {BOLD}{passed}/{total}{RESET}")

if failed == 0:
    print(f"\n  {GREEN}{BOLD}  Все тесты пройдены{RESET}\n")
    sys.exit(0)
else:
    print(f"\n  {RED}{BOLD}  Упало: {failed}{RESET}\n")
    sys.exit(1)