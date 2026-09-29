import psycopg2
from typing import Optional, Dict, Any, List
from .base import StandardRepository

class PostgresStandardRepository(StandardRepository):
    def __init__(self, conn_str: str):
        self.conn_str = conn_str

    def _get_conn(self):
        return psycopg2.connect(self.conn_str)

    def get_standard_by_family_id(self, family_id: str) -> Optional[Dict[str, Any]]:
        try:
            with self._get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT family_id, title_en, status, year FROM standards WHERE family_id = %s LIMIT 1", (family_id,))
                    row = cur.fetchone()
                    if row:
                        return {"family_id": row[0], "title_en": row[1], "status": row[2], "year": row[3]}
            return None
        except Exception:
            return None

    def get_versions(self, family_id: str) -> List[Dict[str, Any]]:
        try:
            with self._get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT version, status, effective_date, supersedes FROM standard_versions WHERE family_id = %s", (family_id,))
                    rows = cur.fetchall()
                    return [{"version": r[0], "status": r[1], "effective_date": r[2], "supersedes": r[3]} for r in rows]
        except Exception:
            return []

    def get_amendments(self, family_id: str) -> List[Dict[str, Any]]:
        return []

