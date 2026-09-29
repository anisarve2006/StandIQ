from typing import Optional, List, Dict, Any
from schemas.domain import VersionInfo, VersionStatus, VersionDiffInfo, AmendmentRecord
from schemas.api import VersionResponse
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
            
        pub_year = str(std.get("year", "")) if std.get("year") else None
        
        return VersionInfo(
            family_id=std.get("family_id", family_id),
            version=pub_year,
            status=status,
            amendment=str(std.get("num_amendments", 0)) if std.get("num_amendments") else None,
            publication_date=pub_year,
            effective_date=pub_year
        )

    def get_version_diff(self, standard_id: str) -> Optional[VersionDiffInfo]:
        """Computes chronological version diff and amendment tracking."""
        parsed = parse_is_identifier(standard_id)
        family_id = parsed.get("family_id", standard_id)
        std = self.repository.get_standard_by_family_id(family_id)
        if not std:
            return None

        amend_rows = self.repository.get_amendments(family_id)
        chronological_amends = []
        diff_summaries = []

        base_year = std.get("year")
        for row in amend_rows:
            rec = AmendmentRecord(
                amendment_no=row.get("amendment_no", 1),
                notification_date=row.get("notification_date"),
                effective_date=row.get("effective_date"),
                gazette_ref=row.get("gazette_ref"),
                clause_affected=row.get("clause_affected"),
                parameter_name=row.get("parameter_name"),
                previous_value=row.get("previous_value"),
                revised_value=row.get("revised_value"),
                change_summary=row.get("change_summary") or "",
                impact_level=row.get("impact_level") or "MAJOR"
            )
            chronological_amends.append(rec)
            diff_summaries.append(f"Amd {rec.amendment_no} ({rec.notification_date or 'Recent'}): {rec.change_summary}")

        if not diff_summaries and std.get("num_amendments", 0) == 0:
            diff_summaries.append(f"Base edition published in {base_year or 'N/A'}. No subsequent amendments on record.")

        return VersionDiffInfo(
            standard_id=std.get("raw_id") or family_id,
            title=std.get("title_en"),
            base_year=base_year,
            current_status=std.get("status", "CURRENT"),
            num_amendments=len(chronological_amends),
            chronological_amendments=chronological_amends,
            diff_summary=diff_summaries
        )

    def get_version_response(self, standard_id: str) -> VersionResponse:
        v_info = self.get_version_info(standard_id)
        v_diff = self.get_version_diff(standard_id)
        return VersionResponse(
            family_id=v_info.family_id,
            version_info=v_info,
            version_diff=v_diff
        )

