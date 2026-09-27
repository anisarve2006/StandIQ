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
            # 1. Build hierarchical inheritance list (e.g. 'IS:10322:P5:S2' -> ['IS:10322:P5:S2', 'IS:10322:P5', 'IS:10322'])
            parts = family_id.split(":")
            hierarchy = [":".join(parts[:i]) for i in range(len(parts), 1, -1)]
            if not hierarchy:
                hierarchy = [family_id]

            # 2. Extract standard number and part/sec for text fallback
            num = parts[1] if len(parts) > 1 else family_id.replace("IS:", "").strip()
            
            # Query exact hierarchical match first
            placeholders = ",".join(["?"] * len(hierarchy))
            cur.execute(f"""
            SELECT scheme, category, sr_no, raw_is_no, product_name, gazette_notification, status, source_url
            FROM cert_rules
            WHERE family_id IN ({placeholders}) OR raw_is_no LIKE ?;
            """, (*hierarchy, f"%{num}%"))
            rows = cur.fetchall()
            
            # Filter out partial standard number collisions (e.g. '1077' matching '10773')
            import re
            exact_num_results = []
            for r in [dict(row) for row in rows]:
                raw_is = r.get("raw_is_no") or ""
                fid = r.get("family_id") or ""
                if fid in hierarchy:
                    exact_num_results.append(r)
                elif re.search(rf'(?<!\d){re.escape(num)}(?!\d)', raw_is):
                    exact_num_results.append(r)
            results = exact_num_results
            if len(parts) >= 3 and results:
                # e.g. section = "2", part = "5"
                sec_num = parts[-1].replace("S", "").replace("P", "")
                part_num = parts[2].replace("P", "") if len(parts) > 2 else ""
                
                # Check for row that explicitly mentions this section or part in raw_is_no
                specific_matches = [
                    r for r in results 
                    if (sec_num and f"Sec {sec_num}" in r.get("raw_is_no", "") or f"Section {sec_num}" in r.get("raw_is_no", ""))
                ]
                if specific_matches:
                    return specific_matches
                
                part_matches = [
                    r for r in results 
                    if (part_num and f"Part {part_num}" in r.get("raw_is_no", "") or f"P{part_num}" in r.get("raw_is_no", ""))
                ]
                if part_matches:
                    return part_matches

            return results
        except Exception:
            return []
        finally:
            conn.close()
