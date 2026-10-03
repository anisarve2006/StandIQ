import psycopg2
from typing import Optional
from datetime import datetime
from config import settings
from schemas.auth import UserResponse, RefreshTokenRecord

class UserRepository:
    def __init__(self):
        self.conn_str = f"dbname={settings.postgres_db} user={settings.postgres_user} password={settings.postgres_password} host={settings.postgres_host} port={settings.postgres_port}"
        
    def _get_connection(self):
        return psycopg2.connect(self.conn_str)

    def create_user(self, email: str, hashed_password: str, full_name: str) -> UserResponse:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO users (email, hashed_password, full_name)
                    VALUES (%s, %s, %s)
                    RETURNING id, email, full_name, role, is_active, created_at, updated_at
                """, (email, hashed_password, full_name))
                row = cur.fetchone()
                conn.commit()
                return UserResponse(
                    id=row[0], email=row[1], full_name=row[2], 
                    role=row[3], is_active=row[4], created_at=row[5], updated_at=row[6]
                )
        finally:
            conn.close()

    def get_user_by_email(self, email: str) -> Optional[dict]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, email, hashed_password, full_name, role, is_active, created_at, updated_at
                    FROM users
                    WHERE email = %s
                """, (email,))
                row = cur.fetchone()
                if row:
                    return {
                        "id": row[0], "email": row[1], "hashed_password": row[2],
                        "full_name": row[3], "role": row[4], "is_active": row[5],
                        "created_at": row[6], "updated_at": row[7]
                    }
                return None
        finally:
            conn.close()

    def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, email, full_name, role, is_active, created_at, updated_at
                    FROM users
                    WHERE id = %s
                """, (user_id,))
                row = cur.fetchone()
                if row:
                    return UserResponse(
                        id=row[0], email=row[1], full_name=row[2], 
                        role=row[3], is_active=row[4], created_at=row[5], updated_at=row[6]
                    )
                return None
        finally:
            conn.close()

    def create_refresh_token(self, user_id: int, token_hash: str, expires_at: datetime) -> None:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
                    VALUES (%s, %s, %s)
                """, (user_id, token_hash, expires_at))
                conn.commit()
        finally:
            conn.close()

    def get_refresh_token_by_hash(self, token_hash: str) -> Optional[RefreshTokenRecord]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, user_id, token_hash, expires_at, revoked_at, created_at, last_used_at
                    FROM refresh_tokens
                    WHERE token_hash = %s
                """, (token_hash,))
                row = cur.fetchone()
                if row:
                    return RefreshTokenRecord(
                        id=row[0], user_id=row[1], token_hash=row[2], 
                        expires_at=row[3], revoked_at=row[4], created_at=row[5], last_used_at=row[6]
                    )
                return None
        finally:
            conn.close()

    def revoke_refresh_token(self, token_hash: str) -> None:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE refresh_tokens
                    SET revoked_at = CURRENT_TIMESTAMP
                    WHERE token_hash = %s AND revoked_at IS NULL
                """, (token_hash,))
                conn.commit()
        finally:
            conn.close()

    def update_refresh_token_last_used(self, token_hash: str) -> None:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE refresh_tokens
                    SET last_used_at = CURRENT_TIMESTAMP
                    WHERE token_hash = %s
                """, (token_hash,))
                conn.commit()
        finally:
            conn.close()
