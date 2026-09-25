"""
Standards Knowledge Graph Expansion Engine (Section 11 & Layer 19 from Architecture Specification).
Expands candidate standards into normative references, test methods, safety codes, and QCO rules.
"""

import sqlite3
from typing import List, Dict, Any

class GraphExpander:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def expand_standard(self, family_id: str, max_allied: int = 10) -> Dict[str, Any]:
        """
        Traverses edges for a given primary standard and aggregates:
        - allied_standards: test methods, safety, terminology, materials
        - supersedes / superseded_by version chain
        - compulsory QCO rules
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # 1. Traverse Graph Edges
        cur.execute("""
        SELECT e.dst_family_id, e.edge_type, e.provenance, e.confidence,
               s.raw_id, s.title_en, s.year, s.status, s.division
        FROM edges e
        LEFT JOIN standards s ON e.dst_family_id = s.family_id
        WHERE e.src_family_id = ?
        LIMIT ?;
        """, (family_id, max_allied))

        allied = []
        for row in cur.fetchall():
            allied.append(dict(row))

        # 2. Check Compulsory Certification / QCO
        cur.execute("""
        SELECT scheme, category, sr_no, raw_is_no, product_name, gazette_notification, status, source_url
        FROM cert_rules
        WHERE family_id = ? OR raw_is_no LIKE ?;
        """, (family_id, f"%{family_id.replace('IS:', '')}%"))

        qco_rules = []
        for row in cur.fetchall():
            qco_rules.append(dict(row))

        conn.close()

        # Determine certification status
        is_mandatory = len(qco_rules) > 0
        cert_summary = {
            "is_mandatory": is_mandatory,
            "status": "MANDATORY" if is_mandatory else "VOLUNTARY / NOT IDENTIFIED",
            "scheme": qco_rules[0]["scheme"] if is_mandatory else None,
            "orders": qco_rules
        }

        return {
            "family_id": family_id,
            "allied_standards": allied,
            "certification": cert_summary
        }
