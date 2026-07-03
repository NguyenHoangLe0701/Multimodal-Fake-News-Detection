import pytest
from fastapi.testclient import TestClient
from run import app

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

def test_api_health(client):
    """Test cơ bản để đảm bảo API backend vẫn sống"""
    response = client.get('/')
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "FastAPI Backend is running!"}
