# Start via `make test-debug` or `make test-release`


async def test_google_auth_missing_token(service_client):
    response = await service_client.post("/auth/google", json={})
    assert response.status == 400


async def test_google_auth_invalid_token(service_client):
    response = await service_client.post(
        "/auth/google", json={"google_token": "invalid"}
    )
    assert response.status == 500
