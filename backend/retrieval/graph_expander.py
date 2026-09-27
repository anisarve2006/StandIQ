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

        # 2. Check Compulsory Certification / QCO (Hierarchical Inheritance)
        parts = family_id.split(":")
        hierarchy = [":".join(parts[:i]) for i in range(len(parts), 1, -1)]
        if not hierarchy:
            hierarchy = [family_id]
        num = parts[1] if len(parts) > 1 else family_id.replace("IS:", "").strip()

        placeholders = ",".join(["?"] * len(hierarchy))
        cur.execute(f"""
        SELECT scheme, category, sr_no, raw_is_no, product_name, gazette_notification, status, source_url
        FROM cert_rules
        WHERE family_id IN ({placeholders}) OR raw_is_no LIKE ?;
        """, (*hierarchy, f"%{num}%"))

        import re
        raw_rows = [dict(row) for row in cur.fetchall()]
        qco_rules = []
        for r in raw_rows:
            raw_is = r.get("raw_is_no") or ""
            fid = r.get("family_id") or ""
            if fid in hierarchy:
                qco_rules.append(r)
            elif re.search(rf'(?<!\d){re.escape(num)}(?!\d)', raw_is):
                qco_rules.append(r)

        # If sectional standard, prioritize specific section/part match
        if len(parts) >= 3 and qco_rules:
            sec_num = parts[-1].replace("S", "").replace("P", "")
            part_num = parts[2].replace("P", "") if len(parts) > 2 else ""
            specific = [r for r in qco_rules if (sec_num and (f"Sec {sec_num}" in r.get("raw_is_no", "") or f"Section {sec_num}" in r.get("raw_is_no", "")))]
            if specific:
                qco_rules = specific
            else:
                part_specific = [r for r in qco_rules if (part_num and (f"Part {part_num}" in r.get("raw_is_no", "") or f"P{part_num}" in r.get("raw_is_no", "")))]
                if part_specific:
                    qco_rules = part_specific

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
