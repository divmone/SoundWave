import json
import urllib.request
import sys

BASE_URL = "http://localhost:80/api/v1.0"

def test(name, url, expected=200):
    try:
        req = urllib.request.Request(f"{BASE_URL}{url}")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == expected:
                print(f"  ✅ {name}")
                return True
            else:
                print(f"  ❌ {name} - got {resp.status}")
                return False
    except urllib.error.HTTPError as e:
        if e.code == expected:
            print(f"  ✅ {name} (404 as expected)")
            return True
        else:
            print(f"  ❌ {name} - got {e.code}")
            return False
    except Exception as e:
        print(f"  ❌ {name} - {e}")
        return False

print("\n🔍 Running API tests...\n")

tests = [
    ("GET /sounds/amount", "/sounds/amount", 200),
    ("GET /sounds/pages/1", "/sounds/pages/1", 200),
    ("GET /sounds/1", "/sounds/1", 200),
    ("GET /sounds/99999", "/sounds/99999", 404),
]

passed = 0
for name, url, expected in tests:
    if test(name, url, expected):
        passed += 1

print(f"\n{'='*40}")
print(f"✅ {passed}/{len(tests)} passed")

if passed == len(tests):
    sys.exit(0)
else:
    sys.exit(1)