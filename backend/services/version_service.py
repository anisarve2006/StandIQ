from typing import Optional
from schemas.domain import VersionInfo, VersionStatus
from data_pipeline.ids import parse_is_identifier
from repositories.base import StandardRepository

class VersionService:
    def __init__(self, repository: StandardRepository):
        self.repository = repository

    def get_version_info(self, standard_id: str) -> VersionInfo:
        parsed = parse_is_identifier(standard_id)
        family_id = parsed.get("family_id", standard_id)
        
        std = self.repository.get_standard_by_family_id(family_id)
        
        if not std:
            return VersionInfo(family_id=family_id, status=VersionStatus.UNKNOWN)
            
        status_str = std.get("status", "").upper()
        if status_str in ["CURRENT", "REAFFIRMED"]:
            status = VersionStatus.CURRENT
        elif status_str == "SUPERSEDED":
            status = VersionStatus.SUPERSEDED
        elif status_str == "WITHDRAWN":
            status = VersionStatus.WITHDRAWN
        else:
            status = VersionStatus.UNKNOWN
            
        # Use repository logic to find supersedes relationships and exact dates if available
        # Note: actual repository rows currently only map `status` and `year`. 
        
        return VersionInfo(
            family_id=std.get("family_id", family_id),
            version=str(std.get("year", "")),
            status=status,
            amendment=str(std.get("num_amendments", 0)) if std.get("num_amendments") else None,
            publication_date=None,
            effective_date=None
        )
