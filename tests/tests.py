import json
import urllib.request
import urllib.error
import sys
import time

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