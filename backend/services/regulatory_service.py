from typing import List
from schemas.domain import CertificationInfo, CertificationType, CertificationStatus
from repositories.base import RegulatoryRepository

class RegulatoryService:
    def __init__(self, repository: RegulatoryRepository):
        self.repository = repository

    def get_certification_info(self, standard_id: str) -> List[CertificationInfo]:
        rules = self.repository.get_certification_rules(standard_id)
        
        results = []
        if rules:
            for rule in rules:
                scheme = rule.get("scheme", "").upper()
                c_type = CertificationType.BIS_PRODUCT_CERTIFICATION
                if "QCO" in scheme or "QUALITY CONTROL" in scheme:
                    c_type = CertificationType.QCO
                elif "CRS" in scheme:
                    c_type = CertificationType.CRS
                elif "HALLMARK" in scheme:
                    c_type = CertificationType.HALLMARKING
                    
                status_raw = rule.get("status", "").upper()
                if status_raw == "MANDATORY" or c_type == CertificationType.QCO:
                    status = CertificationStatus.REQUIRED
                elif status_raw == "CONDITIONAL":
                    status = CertificationStatus.UNKNOWN
                else:
                    status = CertificationStatus.REQUIRED
                    
                results.append(CertificationInfo(
                    standard=standard_id,
                    certification_type=c_type,
                    status=status,
                    mandatory=(status == CertificationStatus.REQUIRED),
                    applicability=rule.get("product_name"),
                    source=rule.get("gazette_notification")
                ))
        else:
            # By default, BIS certification is voluntary/optional if not found in mandatory list
            results.append(CertificationInfo(
                standard=standard_id,
                certification_type=CertificationType.BIS_PRODUCT_CERTIFICATION,
                status=CertificationStatus.OPTIONAL,
                mandatory=False
            ))
            
        return results
