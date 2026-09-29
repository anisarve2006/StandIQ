import json
import sqlite3
from typing import Dict, List, Optional
from threading import Lock
from schemas.api import ProcurementSessionResponse
from db.connection import get_sqlite_connection
from .base import SessionRepository

class InMemorySessionRepository(SessionRepository):
    def __init__(self):
        self.sessions: Dict[str, ProcurementSessionResponse] = {}

    def create(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        self.sessions[session.session_id] = session
        return session

    def get(self, session_id: str) -> Optional[ProcurementSessionResponse]:
        return self.sessions.get(session_id)

    def update(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        if session.session_id in self.sessions:
            self.sessions[session.session_id] = session
        return session


class SQLiteSessionRepository(SessionRepository):
    """
    Persistent SQLite-backed repository for Procurement Sessions.
    Survives server restarts and provides fast thread-safe in-memory caching.
    """
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._lock = Lock()
        self._cache: Dict[str, ProcurementSessionResponse] = {}
        self._init_db()

    def _init_db(self):
        conn = get_sqlite_connection(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS procurement_sessions (
                session_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                verification_state TEXT NOT NULL,
                data_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_procurement_sessions_updated 
            ON procurement_sessions(updated_at DESC);
        """)
        conn.commit()

        # Pre-populate cache from persistent storage
        cur.execute("SELECT session_id, data_json FROM procurement_sessions")
        for row in cur.fetchall():
            try:
                sid, d_json = row[0], row[1]
                data = json.loads(d_json)
                self._cache[sid] = ProcurementSessionResponse(**data)
            except Exception:
                pass
        conn.close()

    def set_db_path(self, new_db_path: str):
        """Allows switching database path dynamically (e.g. in test fixtures)."""
        with self._lock:
            self.db_path = new_db_path
            self._cache.clear()
            self._init_db()

    @property
    def sessions(self) -> Dict[str, ProcurementSessionResponse]:
        """Backwards compatibility for existing code inspecting session_repo.sessions."""
        with self._lock:
            return dict(self._cache)

    def create(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        with self._lock:
            self._cache[session.session_id] = session
            conn = get_sqlite_connection(self.db_path)
            cur = conn.cursor()
            payload = session.model_dump_json() if hasattr(session, "model_dump_json") else session.json()
            cur.execute("""
                INSERT OR REPLACE INTO procurement_sessions (session_id, title, verification_state, data_json, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                session.session_id,
                session.title,
                session.verification_state,
                payload
            ))
            conn.commit()
            conn.close()
            return session

    def get(self, session_id: str) -> Optional[ProcurementSessionResponse]:
        with self._lock:
            if session_id in self._cache:
                return self._cache[session_id]

            conn = get_sqlite_connection(self.db_path)
            cur = conn.cursor()
            cur.execute("SELECT data_json FROM procurement_sessions WHERE session_id = ?", (session_id,))
            row = cur.fetchone()
            conn.close()
            if not row:
                return None
            try:
                data = json.loads(row[0])
                sess = ProcurementSessionResponse(**data)
                self._cache[session_id] = sess
                return sess
            except Exception:
                return None

    def update(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        return self.create(session)

    def list_all(self) -> List[ProcurementSessionResponse]:
        with self._lock:
            return list(self._cache.values())
