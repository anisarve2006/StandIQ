import sqlite3
from typing import List
from schemas.domain import CertificationInfo, CertificationType, CertificationStatus

class RegulatoryService:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_certification_info(self, standard_id: str) -> List[CertificationInfo]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        # Check cert_rules table for QCO or BIS product cert
        cur.execute("""
        SELECT scheme, category, sr_no, raw_is_no, product_name, gazette_notification, status, source_url
        FROM cert_rules
        WHERE family_id = ? OR raw_is_no LIKE ?;
        """, (standard_id, f"%{standard_id.replace('IS:', '')}%"))
        
        rules = cur.fetchall()
        conn.close()
        
        results = []
        if rules:
            for r in rules:
                rule = dict(r)
                scheme = rule.get("scheme", "").upper()
                c_type = CertificationType.BIS_PRODUCT_CERTIFICATION
                if "QCO" in scheme or "QUALITY CONTROL" in scheme:
                    c_type = CertificationType.QCO
                elif "CRS" in scheme:
                    c_type = CertificationType.CRS
                elif "HALLMARK" in scheme:
                    c_type = CertificationType.HALLMARKING
                    
                results.append(CertificationInfo(
                    standard=standard_id,
                    certification_type=c_type,
                    status=CertificationStatus.REQUIRED,
                    mandatory=True,
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
