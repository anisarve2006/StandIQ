import pytest
import time
from core.security import (
    hash_password, verify_password, create_access_token, decode_access_token,
    generate_refresh_token, hash_refresh_token
)
from config import settings

def test_password_hashing():
    pwd = "supersecretpassword"
    hashed = hash_password(pwd)
    assert pwd != hashed
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_access_token():
    user_id = "user123"
    role = "ADMIN"
    token = create_access_token(user_id, role)
    assert token is not None
    
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == user_id
    assert decoded["role"] == role
    assert "exp" in decoded

def test_expired_token(monkeypatch):
    monkeypatch.setattr(settings, "access_token_expire_minutes", 0)
    user_id = "user123"
    role = "ADMIN"
    token = create_access_token(user_id, role)
    time.sleep(1)
    
    decoded = decode_access_token(token)
    assert decoded is None

def test_invalid_token():
    assert decode_access_token("invalid.token.here") is None

def test_refresh_token():
    token1 = generate_refresh_token()
    token2 = generate_refresh_token()
    assert token1 != token2
    assert len(token1) > 20
    
    hashed1 = hash_refresh_token(token1)
    hashed2 = hash_refresh_token(token2)
    assert hashed1 != token1
    assert hashed1 != hashed2
