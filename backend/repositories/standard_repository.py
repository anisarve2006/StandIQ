import sqlite3
from typing import Optional, Dict, Any, List
from .base import StandardRepository

class SQLiteStandardRepository(StandardRepository):
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_standard_by_family_id(self, family_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM standards WHERE family_id = ? OR number = ? LIMIT 1", (family_id, family_id))
            row = cur.fetchone()
            if row:
                return dict(row)
            return None
        except Exception:
            return None
        finally:
            conn.close()

    def get_versions(self, family_id: str) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM standards WHERE family_id = ? ORDER BY year DESC", (family_id,))
            rows = cur.fetchall()
            return [dict(row) for row in rows]
        except Exception:
            return []
        finally:
            conn.close()

    def get_amendments(self, family_id: str) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cur = conn.cursor()
        try:
            cur.execute("""
            SELECT * FROM amendments 
            WHERE family_id = ? 
            ORDER BY amendment_no ASC
            """, (family_id,))
            rows = cur.fetchall()
            return [dict(row) for row in rows]
        except Exception:
            return []
        finally:
            conn.close()

