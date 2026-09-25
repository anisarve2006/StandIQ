import sqlite3
from typing import Optional
from schemas.domain import VersionInfo, VersionStatus
from data_pipeline.ids import parse_is_identifier

class VersionService:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_version_info(self, standard_id: str) -> VersionInfo:
        parsed = parse_is_identifier(standard_id)
        family_id = parsed.get("family_id", standard_id)
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM standards WHERE family_id = ? OR number = ? LIMIT 1", (family_id, parsed.get("number")))
        row = cur.fetchone()
        
        if not row:
            conn.close()
            return VersionInfo(family_id=family_id, status=VersionStatus.UNKNOWN)
            
        std = dict(row)
        conn.close()
        
        status_str = std.get("status", "").upper()
        if status_str in ["CURRENT", "REAFFIRMED"]:
            status = VersionStatus.CURRENT
        elif status_str == "SUPERSEDED":
            status = VersionStatus.SUPERSEDED
        elif status_str == "WITHDRAWN":
            status = VersionStatus.WITHDRAWN
        else:
            status = VersionStatus.UNKNOWN
            
        return VersionInfo(
            family_id=std.get("family_id", family_id),
            version=str(std.get("year", "")),
            status=status,
            amendment=str(std.get("num_amendments", 0)) if std.get("num_amendments") else None
        )
