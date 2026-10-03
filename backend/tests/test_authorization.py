import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from api_service import app
from schemas.auth import UserResponse
from datetime import datetime, timezone

client = TestClient(app)

def _create_mock_user(role: str):
    return UserResponse(
        id=1,
        email="test@example.com",
        full_name="Test User",
        role=role,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

def test_authenticated_procurement_officer_access():
    """Test that authenticated PROCUREMENT_OFFICER can access existing protected endpoints."""
    # Setup mock
    from dependencies.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: _create_mock_user("PROCUREMENT_OFFICER")
    
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    app.dependency_overrides.clear()

def test_authenticated_auditor_access():
    """Test that authenticated AUDITOR can access existing protected endpoints."""
    from dependencies.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: _create_mock_user("AUDITOR")
    
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    app.dependency_overrides.clear()

def test_authenticated_admin_access():
    """Test that authenticated ADMIN can access existing protected endpoints."""
    from dependencies.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: _create_mock_user("ADMIN")
    
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    app.dependency_overrides.clear()

def test_unauthenticated_access_denied():
    """Test that unauthenticated users receive 401 on protected endpoints."""
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 401
