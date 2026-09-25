"""
Agentic Completeness Engine & Iterative Verification Loop.
Layer 22 & 23 from Architecture Specification & PDF Section 21-23.

Evaluates multi-faceted procurement coverage:
1. Product Standard (Primary)
2. Testing / Method of Test Standard
3. Safety & Environmental Code
4. Installation / Maintenance Practice
5. Compulsory Certification (QCO Status)
6. Version Validity (Latest Current vs Superseded)

If any critical facet is missing, automatically generates targeted sub-queries,
executes bounded iterative retrieval (max 2 iterations), and ensures full
coverage for tender specifications.
"""

import sqlite3
from typing import Dict, Any, List, Optional

class CompletenessEngine:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.max_iterations = 2
        self.target_coverage_threshold = 0.80

    def evaluate_coverage(self, primary_standard: Optional[Dict[str, Any]],
                          allied_standards: List[Dict[str, Any]],
                          certification_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assesses completeness across the 6 core procurement facets:
        Product, Testing, Safety, Installation, Certification, Version.
        """
        coverage = {
            "product": primary_standard is not None,
            "testing": False,
            "safety": False,
            "installation": False,
            "certification": certification_info.get("status") in ["MANDATORY", "VOLUNTARY / NOT IDENTIFIED"],
            "version": False
        }

        # Check version validity
        if primary_standard:
            status = primary_standard.get("status", "").upper()
            coverage["version"] = status in ["CURRENT", "REAFFIRMED"]

        # Check allied standard roles
        for edge in allied_standards:
            role = edge.get("edge_type", "").upper()
            title = (edge.get("title_en") or "").lower()

            if "TEST" in role or "method of test" in title or "testing" in title or "sampling" in title:
                coverage["testing"] = True
            if "SAFETY" in role or "safety" in title or "fire" in title:
                coverage["safety"] = True
            if "INSTALLATION" in role or "code of practice" in title or "installation" in title or "laying" in title:
                coverage["installation"] = True

        covered_count = sum(1 for v in coverage.values() if v)
        total_facets = len(coverage)
        coverage_ratio = covered_count / total_facets

        missing_facets = [facet for facet, is_covered in coverage.items() if not is_covered]

        return {
            "coverage_ratio": round(coverage_ratio, 2),
            "is_complete": coverage_ratio >= self.target_coverage_threshold,
            "facets": coverage,
            "missing_facets": missing_facets
        }

    def fetch_targeted_allied(self, family_id: str, product_keyword: str, missing_facet: str) -> List[Dict[str, Any]]:
        """
        Executes a targeted sub-query against standards.db for missing facet.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        discovered = []

        # 1. First look in edges
        edge_filter = "%"
        if missing_facet == "testing":
            edge_filter = "%TEST%"
        elif missing_facet == "safety":
            edge_filter = "%SAFETY%"
        elif missing_facet == "installation":
            edge_filter = "%INSTALLATION%"

        cur.execute("""
        SELECT e.dst_family_id, e.edge_type, e.provenance, e.confidence,
               s.raw_id, s.title_en, s.year, s.status, s.division
        FROM edges e
        JOIN standards s ON e.dst_family_id = s.family_id
        WHERE e.src_family_id = ? AND e.edge_type LIKE ?
        LIMIT 3;
        """, (family_id, edge_filter))
        for row in cur.fetchall():
            discovered.append(dict(row))

        # 2. If no direct edge, run targeted lexical discovery on same product
        if not discovered and product_keyword:
            keyword_clean = product_keyword.strip().split()[0]  # e.g. "motor", "rebar", "pump"
            query_pattern = f"%{keyword_clean}%"
            
            if missing_facet == "testing":
                cur.execute("""
                SELECT family_id, raw_id, title_en, year, status, division,
                       'TEST_METHOD' as edge_type, 'INFERRED_LEXICAL' as provenance, 0.85 as confidence
                FROM standards 
                WHERE (title_en LIKE '%method%test%' OR title_en LIKE '%testing%')
                  AND title_en LIKE ?
                ORDER BY year DESC LIMIT 2;
                """, (query_pattern,))
            elif missing_facet == "safety":
                cur.execute("""
                SELECT family_id, raw_id, title_en, year, status, division,
                       'SAFETY_STANDARD' as edge_type, 'INFERRED_LEXICAL' as provenance, 0.85 as confidence
                FROM standards 
                WHERE (title_en LIKE '%safety%' OR title_en LIKE '%protection%')
                  AND title_en LIKE ?
                ORDER BY year DESC LIMIT 2;
                """, (query_pattern,))
            elif missing_facet == "installation":
                cur.execute("""
                SELECT family_id, raw_id, title_en, year, status, division,
                       'INSTALLATION_STANDARD' as edge_type, 'INFERRED_LEXICAL' as provenance, 0.85 as confidence
                FROM standards 
                WHERE (title_en LIKE '%code of practice%' OR title_en LIKE '%installation%' OR title_en LIKE '%maintenance%')
                  AND title_en LIKE ?
                ORDER BY year DESC LIMIT 2;
                """, (query_pattern,))

            for row in cur.fetchall():
                discovered.append(dict(row))

        conn.close()
        return discovered

    def run_agentic_loop(self, primary_standard: Dict[str, Any],
                         allied_standards: List[Dict[str, Any]],
                         certification_info: Dict[str, Any],
                         product_name: str) -> Dict[str, Any]:
        """
        Executes the iterative agentic completeness loop up to MAX_ITERATIONS.
        Dynamically refines evidence until coverage threshold is met or search is exhausted.
        """
        current_allied = list(allied_standards)
        evaluation = self.evaluate_coverage(primary_standard, current_allied, certification_info)
        
        iteration = 0
        loop_history = []

        while iteration < self.max_iterations and not evaluation["is_complete"]:
            iteration += 1
            missing = evaluation["missing_facets"]
            added_this_round = []

            family_id = primary_standard.get("family_id", "")
            for facet in missing:
                if facet in ["testing", "safety", "installation"]:
                    discovered = self.fetch_targeted_allied(family_id, product_name, facet)
                    for item in discovered:
                        dst_id = item.get("dst_family_id") or item.get("family_id")
                        # Avoid duplicates
                        existing_ids = {a.get("dst_family_id") or a.get("family_id") for a in current_allied}
                        if dst_id not in existing_ids:
                            current_allied.append(item)
                            added_this_round.append(dst_id)

            # Re-evaluate coverage
            new_eval = self.evaluate_coverage(primary_standard, current_allied, certification_info)
            loop_history.append({
                "iteration": iteration,
                "missing_before": missing,
                "added_standards": added_this_round,
                "coverage_after": new_eval["coverage_ratio"]
            })
            evaluation = new_eval

            # If no new standards were found, break early
            if not added_this_round:
                break

        return {
            "final_coverage": evaluation,
            "allied_standards": current_allied,
            "iterations_run": iteration,
            "loop_history": loop_history
        }
