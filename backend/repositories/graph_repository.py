import sqlite3
from typing import Dict, Any, List
from .base import GraphRepository
from db.connection import get_sqlite_connection

class SQLiteGraphRepository(GraphRepository):
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _get_conn(self):
        return get_sqlite_connection(self.db_path)

    def get_allied_standards(self, family_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cur = conn.cursor()
        try:
            # Query edges where the source is the family_id
            cur.execute("""
            SELECT e.edge_type, e.dst_family_id, e.provenance, s.title_en, s.status, s.year
            FROM edges e
            LEFT JOIN standards s ON e.dst_family_id = s.family_id
            WHERE e.src_family_id = ?
            LIMIT ?;
            """, (family_id, limit))
            
            rows = cur.fetchall()
            return [dict(row) for row in rows]
        except Exception:
            return []
        finally:
            conn.close()
