import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock

from api_service import app
from dependencies.auth import get_auth_service
from services.auth_service import AuthException
from schemas.auth import UserResponse
from core.security import create_access_token

client = TestClient(app)

@pytest.fixture
def mock_auth_service():
    mock = Mock()
    app.dependency_overrides[get_auth_service] = lambda: mock
    yield mock
    app.dependency_overrides.clear()

def test_register_success(mock_auth_service):
    mock_auth_service.register.return_value = UserResponse(
        id=1, email="test@a.com", full_name="A", role="PROCUREMENT_OFFICER", is_active=True
    )
    res = client.post("/auth/register", json={
        "email": "test@a.com", "password": "pass", "full_name": "A"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "test@a.com"
    assert "password" not in data
    assert "hashed_password" not in data

def test_register_duplicate(mock_auth_service):
    mock_auth_service.register.side_effect = AuthException("User with this email already exists")
    res = client.post("/auth/register", json={
        "email": "test@a.com", "password": "pass", "full_name": "A"
    })
    assert res.status_code == 409

def test_login_success(mock_auth_service):
    mock_auth_service.login.return_value = {
        "access_token": "acc_token",
        "refresh_token": "ref_token",
        "user": UserResponse(id=1, email="a@a.com", full_name="A", role="ADMIN", is_active=True)
    }
    res = client.post("/auth/login", json={"email": "a@a.com", "password": "p", "full_name": "A"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" not in data
    
    # Check cookies
    cookies = res.headers.get_list("set-cookie")
    assert len(cookies) > 0
    cookie_str = cookies[0].lower()
    assert "httponly" in cookie_str

def test_login_invalid(mock_auth_service):
    mock_auth_service.login.side_effect = AuthException("Invalid email or password")
    res = client.post("/auth/login", json={"email": "a@a.com", "password": "p", "full_name": "A"})
    assert res.status_code == 401

def test_refresh_success(mock_auth_service):
    mock_auth_service.refresh.return_value = {
        "access_token": "new_acc",
        "refresh_token": "new_ref"
    }
    client.cookies.clear()
    res = client.post("/auth/refresh", cookies={"refresh_token": "old_ref"})
    assert res.status_code == 200
    data = res.json()
    assert data["access_token"] == "new_acc"
    assert "refresh_token" not in data
    
    # Cookie is updated in header
    cookies = res.headers.get_list("set-cookie")
    assert len(cookies) > 0
    assert "new_ref" in cookies[0]

def test_refresh_missing_cookie(mock_auth_service):
    # reset cookies
    client.cookies.clear()
    res = client.post("/auth/refresh")
    assert res.status_code == 401
    assert "Missing refresh token" in res.text

def test_logout(mock_auth_service):
    client.cookies.clear()
    res = client.post("/auth/logout", cookies={"refresh_token": "sometoken"})
    assert res.status_code == 200
    cookies = res.headers.get_list("set-cookie")
    assert len(cookies) > 0
    assert "max-age=0" in cookies[0].lower() or "expires=" in cookies[0].lower()

# /me endpoint tests using the actual JWT mechanism

def test_me_valid_token(mock_auth_service):
    # /me does NOT use get_auth_service.login, it uses get_auth_service().user_repo.get_user_by_id
    mock_auth_service.user_repo.get_user_by_id.return_value = UserResponse(
        id=1, email="a@a.com", full_name="A", role="USER", is_active=True
    )
    # Generate a real token
    token = create_access_token(user_id=1, role="USER")
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["id"] == 1

def test_me_missing_token():
    res = client.get("/auth/me")
    assert res.status_code == 401

def test_me_invalid_token():
    res = client.get("/auth/me", headers={"Authorization": "Bearer badtoken"})
    assert res.status_code == 401

def test_me_inactive_user(mock_auth_service):
    mock_auth_service.user_repo.get_user_by_id.return_value = UserResponse(
        id=1, email="a@a.com", full_name="A", role="USER", is_active=False
    )
    token = create_access_token(user_id=1, role="USER")
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401
