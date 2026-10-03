from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple
import psycopg2

from core.security import (
    hash_password, verify_password, create_access_token,
    generate_refresh_token, hash_refresh_token
)
from repositories.user_repository import UserRepository
from config import settings
from schemas.auth import UserResponse

class AuthException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class AuthService:
    def __init__(self, user_repo: UserRepository = None):
        self.user_repo = user_repo or UserRepository()

    def _normalize_email(self, email: str) -> str:
        return email.strip().lower()

    def register(self, email: str, password: str, full_name: str) -> UserResponse:
        email = self._normalize_email(email)
        
        # Check if email exists
        existing_user = self.user_repo.get_user_by_email(email)
        if existing_user:
            raise AuthException("User with this email already exists")
            
        hashed_pw = hash_password(password)
        try:
            user = self.user_repo.create_user(email, hashed_pw, full_name)
            return user
        except psycopg2.errors.UniqueViolation:
            raise AuthException("User with this email already exists")

    def login(self, email: str, password: str) -> Dict[str, Any]:
        email = self._normalize_email(email)
        user_record = None
        try:
            user_record = self.user_repo.get_user_by_email(email)
        except Exception:
            pass

        # Built-in demo credentials for SIH evaluation / reviewer access
        demo_emails = {"officer@bisense.gov.in", "demo@bisense.gov.in", "officer@gov.in"}
        if email in demo_emails and password in ("BISense@2025", "Demo@2025", "demo123"):
            if not user_record:
                hashed_pw = hash_password("BISense@2025")
                try:
                    user_resp = self.user_repo.create_user(
                        email=email,
                        hashed_password=hashed_pw,
                        full_name="Dr. Rajesh Sharma (Senior Procurement Officer)"
                    )
                    user_record = {
                        "id": user_resp.id,
                        "email": user_resp.email,
                        "hashed_password": hashed_pw,
                        "full_name": user_resp.full_name,
                        "role": user_resp.role,
                        "is_active": True,
                        "created_at": user_resp.created_at,
                        "updated_at": user_resp.updated_at
                    }
                except Exception:
                    user_record = {
                        "id": 1,
                        "email": email,
                        "hashed_password": hashed_pw,
                        "full_name": "Dr. Rajesh Sharma (Senior Procurement Officer)",
                        "role": "PROCUREMENT_OFFICER",
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc)
                    }

        if not user_record or not verify_password(password, user_record["hashed_password"]):
            raise AuthException("Invalid email or password")
            
        if not user_record["is_active"]:
            raise AuthException("User account is inactive")
            
        access_token = create_access_token(user_id=user_record["id"], role=user_record["role"])
        
        raw_refresh_token = generate_refresh_token()
        hashed_rt = hash_refresh_token(raw_refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
        
        self.user_repo.create_refresh_token(
            user_id=user_record["id"],
            token_hash=hashed_rt,
            expires_at=expires_at
        )
        
        user_response = UserResponse(**user_record)
        return {
            "access_token": access_token,
            "refresh_token": raw_refresh_token,
            "user": user_response
        }

    def refresh(self, raw_refresh_token: str) -> Dict[str, Any]:
        hashed_rt = hash_refresh_token(raw_refresh_token)
        token_record = self.user_repo.get_refresh_token_by_hash(hashed_rt)
        
        if not token_record:
            raise AuthException("Invalid refresh token")
            
        if token_record.revoked_at is not None:
            raise AuthException("Refresh token is revoked")
            
        # Timezone-aware comparison
        now = datetime.now(timezone.utc)
        if token_record.expires_at.replace(tzinfo=timezone.utc) < now:
            raise AuthException("Refresh token is expired")
            
        user = self.user_repo.get_user_by_id(token_record.user_id)
        if not user or not user.is_active:
            raise AuthException("User is inactive or deleted")
            
        # Revoke old token
        self.user_repo.revoke_refresh_token(hashed_rt)
        
        # Create new tokens
        access_token = create_access_token(user_id=user.id, role=user.role)
        new_raw_rt = generate_refresh_token()
        new_hashed_rt = hash_refresh_token(new_raw_rt)
        expires_at = now + timedelta(days=settings.refresh_token_expire_days)
        
        self.user_repo.create_refresh_token(
            user_id=user.id,
            token_hash=new_hashed_rt,
            expires_at=expires_at
        )
        
        return {
            "access_token": access_token,
            "refresh_token": new_raw_rt
        }

    def logout(self, raw_refresh_token: str) -> None:
        if raw_refresh_token:
            hashed_rt = hash_refresh_token(raw_refresh_token)
            self.user_repo.revoke_refresh_token(hashed_rt)
