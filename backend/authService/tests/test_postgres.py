# Start via `make test-debug` or `make test-release`


async def test_google_auth_new_user(service_client, mockserver):
    @mockserver.json_handler("/tokeninfo")
    def mock_google(request):
        return {
            "sub": "google-id-123",
            "email": "test@example.com",
            "name": "Test User",
        }

    response = await service_client.post(
        "/auth/google", json={"google_token": "valid-token"}
    )
    assert response.status == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "Test User"


async def test_google_auth_existing_user(service_client, mockserver):
    @mockserver.json_handler("/tokeninfo")
    def mock_google(request):
        return {
            "sub": "google-id-123",
            "email": "test@example.com",
            "name": "Test User",
        }

    # первый вход — создаёт пользователя
    await service_client.post("/auth/google", json={"google_token": "valid-token"})

    # второй вход — возвращает существующего
    response = await service_client.post(
        "/auth/google", json={"google_token": "valid-token"}
    )
    assert response.status == 200
    data = response.json()
    assert data["email"] == "test@example.com"
