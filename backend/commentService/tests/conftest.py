import pytest


pytest_plugins = [
    "pytest_userver.plugins.core",
    "pytest_userver.plugins.mongo",
]


MONGO_COLLECTIONS = {
    "hello_users": {
        "settings": {
            "collection": "hello_users",
            "connection": "admin",
            "database": "admin",
        },
        "indexes": [],
    },
}


@pytest.fixture(scope="session")
def mongodb_settings():
    return MONGO_COLLECTIONS
