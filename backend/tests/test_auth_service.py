import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta, timezone

from services.auth_service import AuthService, AuthException
from schemas.auth import UserResponse, RefreshTokenRecord
from core.security import hash_password, verify_password, hash_refresh_token

@pytest.fixture
def mock_user_repo():
    return Mock()

@pytest.fixture
def auth_service(mock_user_repo):
    return AuthService(user_repo=mock_user_repo)

def test_register_success(auth_service, mock_user_repo):
    mock_user_repo.get_user_by_email.return_value = None
    mock_user_repo.create_user.return_value = UserResponse(
        id=1, email="test@example.com", full_name="Test User", role="PROCUREMENT_OFFICER", is_active=True
    )
    
    user = auth_service.register(" Test@Example.com ", "password123", "Test User")
    
    assert user.email == "test@example.com"
    # Ensure email is normalized
    mock_user_repo.get_user_by_email.assert_called_once_with("test@example.com")
    # Verify password was hashed
    args, _ = mock_user_repo.create_user.call_args
    assert args[0] == "test@example.com"
    assert verify_password("password123", args[1]) is True

def test_register_duplicate_email(auth_service, mock_user_repo):
    mock_user_repo.get_user_by_email.return_value = {"id": 1}
    with pytest.raises(AuthException, match="User with this email already exists"):
        auth_service.register("test@example.com", "password", "Name")

def test_login_success(auth_service, mock_user_repo):
    hashed_pw = hash_password("mypassword")
    mock_user_repo.get_user_by_email.return_value = {
        "id": 1, "email": "test@example.com", "hashed_password": hashed_pw,
        "full_name": "Test", "role": "ADMIN", "is_active": True, 
        "created_at": datetime.now(), "updated_at": datetime.now()
    }
    
    result = auth_service.login(" Test@example.com ", "mypassword")
    
    assert "access_token" in result
    assert "refresh_token" in result
    assert result["user"].id == 1
    
    # Refresh token should be saved to DB as hash
    assert mock_user_repo.create_refresh_token.called

def test_login_invalid_password(auth_service, mock_user_repo):
    hashed_pw = hash_password("mypassword")
    mock_user_repo.get_user_by_email.return_value = {
        "id": 1, "email": "test@example.com", "hashed_password": hashed_pw,
        "full_name": "Test", "role": "ADMIN", "is_active": True, 
        "created_at": datetime.now(), "updated_at": datetime.now()
    }
    
    with pytest.raises(AuthException, match="Invalid email or password"):
        auth_service.login("test@example.com", "wrongpassword")

def test_login_inactive_user(auth_service, mock_user_repo):
    hashed_pw = hash_password("mypassword")
    mock_user_repo.get_user_by_email.return_value = {
        "id": 1, "email": "test@example.com", "hashed_password": hashed_pw,
        "full_name": "Test", "role": "ADMIN", "is_active": False, 
        "created_at": datetime.now(), "updated_at": datetime.now()
    }
    with pytest.raises(AuthException, match="User account is inactive"):
        auth_service.login("test@example.com", "mypassword")

def test_refresh_success(auth_service, mock_user_repo):
    now = datetime.now(timezone.utc)
    mock_user_repo.get_refresh_token_by_hash.return_value = RefreshTokenRecord(
        id=1, user_id=1, token_hash="hashedrt", expires_at=now + timedelta(days=1),
        revoked_at=None, created_at=now, last_used_at=None
    )
    mock_user_repo.get_user_by_id.return_value = UserResponse(
        id=1, email="a@a.com", full_name="A", role="USER", is_active=True
    )
    
    res = auth_service.refresh("raw_rt")
    assert "access_token" in res
    assert "refresh_token" in res
    
    # Old token revoked
    mock_user_repo.revoke_refresh_token.assert_called_once()
    # New token created
    assert mock_user_repo.create_refresh_token.called

def test_refresh_expired(auth_service, mock_user_repo):
    now = datetime.now(timezone.utc)
    mock_user_repo.get_refresh_token_by_hash.return_value = RefreshTokenRecord(
        id=1, user_id=1, token_hash="hashedrt", expires_at=now - timedelta(days=1),
        revoked_at=None, created_at=now, last_used_at=None
    )
    with pytest.raises(AuthException, match="Refresh token is expired"):
        auth_service.refresh("raw_rt")

def test_refresh_revoked(auth_service, mock_user_repo):
    now = datetime.now(timezone.utc)
    mock_user_repo.get_refresh_token_by_hash.return_value = RefreshTokenRecord(
        id=1, user_id=1, token_hash="hashedrt", expires_at=now + timedelta(days=1),
        revoked_at=now, created_at=now, last_used_at=None
    )
    with pytest.raises(AuthException, match="Refresh token is revoked"):
        auth_service.refresh("raw_rt")

def test_logout(auth_service, mock_user_repo):
    raw_rt = "somerawtoken"
    auth_service.logout(raw_rt)
    
    # verify revoke called with hash
    mock_user_repo.revoke_refresh_token.assert_called_once()
    args, _ = mock_user_repo.revoke_refresh_token.call_args
    assert args[0] == hash_refresh_token(raw_rt)
