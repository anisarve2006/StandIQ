import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock

from api_service import app
from dependencies.auth import get_auth_service
from schemas.auth import UserResponse
from core.security import create_access_token

client = TestClient(app)

@pytest.fixture
def mock_auth_service():
    mock = Mock()
    app.dependency_overrides[get_auth_service] = lambda: mock
    
    # Also mock user repo for get_current_user
    mock.user_repo.get_user_by_id.return_value = UserResponse(
        id=1, email="test@example.com", full_name="Admin", role="ADMIN", is_active=True
    )
    
    yield mock
    app.dependency_overrides.clear()

def test_protected_endpoint_without_auth():
    # /api/v1/dashboard/summary is a protected endpoint
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 401

def test_protected_endpoint_with_auth(mock_auth_service):
    token = create_access_token(user_id=1, role="ADMIN")
    res = client.get("/api/v1/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "active_procurements" in res.json()

def test_public_endpoint_without_auth():
    # /api/v1/health should remain public
    res = client.get("/api/v1/health")
    assert res.status_code == 200

def test_auth_endpoints_remain_public(mock_auth_service):
    from services.auth_service import AuthException
    mock_auth_service.login.side_effect = AuthException("Invalid email or password")
    res = client.post("/auth/login", json={"email": "bad", "password": "bad", "full_name": ""})
    # Should get 401 from login failing, not 401 missing token
    assert res.status_code == 401
    assert "Invalid email or password" in res.text or "validation" in res.text.lower() or "credentials" in res.text.lower()
