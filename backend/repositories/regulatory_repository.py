import sqlite3
from typing import Dict, Any, List
from .base import RegulatoryRepository

class SQLiteRegulatoryRepository(RegulatoryRepository):
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_certification_rules(self, family_id: str) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cur = conn.cursor()
        try:
            # We also check LIKE raw_is_no for robust fallback
            cur.execute("""
            SELECT scheme, category, sr_no, raw_is_no, product_name, gazette_notification, status, source_url
            FROM cert_rules
            WHERE family_id = ? OR raw_is_no LIKE ?;
            """, (family_id, f"%{family_id.replace('IS:', '')}%"))
            rows = cur.fetchall()
            return [dict(row) for row in rows]
        except Exception:
            return []
        finally:
            conn.close()
