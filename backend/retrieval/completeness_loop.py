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
from db.connection import get_sqlite_connection

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

    def fetch_targeted_allied(self, family_id: str, product_keyword: str, missing_facet: str, primary_division: str = "") -> List[Dict[str, Any]]:
        """
        Executes a targeted sub-query against standards.db for missing facet.
        """
        conn = get_sqlite_connection(self.db_path)
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

        # 2. If no direct edge, run targeted lexical discovery on same product within same division
        division = primary_division or ""
        if not discovered and product_keyword:
            # Extract substantive keyword (ignoring tender boilerplate and generic adjectives)
            import re
            stop_words = {
                "specification", "specifications", "spec", "standard", "standards", "code",
                "practice", "method", "methods", "test", "testing", "requirements", "guidelines",
                "supply", "supplying", "providing", "fixing", "installing", "installation",
                "procurement", "item", "items", "work", "works", "use", "used", "for", "and", "the",
                "with", "from", "into", "under", "over", "etc", "part", "section", "clause",
                # Generic adjectives/nouns that cause cross-domain false positives:
                "structural", "general", "special", "commercial", "common", "various", "building",
                "buildings", "material", "materials", "product", "products", "criteria", "design",
                # Processing/state adjectives:
                "oriented", "unplasticized", "plasticized", "chlorinated", "galvanized", "drawn",
                "extruded", "moulded", "molded", "seamless", "welded", "woven", "knitted",
                "hot", "cold", "high", "low", "medium", "heavy", "light", "rigid", "flexible", "solid", "hollow"
            }
            tokens = [t for t in re.findall(r'[a-zA-Z]{3,}', product_keyword.lower()) if t not in stop_words]
            if tokens:
                # Prioritize key substantive noun (e.g. 'bolts' -> 'bolt', 'cables' -> 'cable')
                target_word = tokens[0].rstrip('s') if len(tokens[0]) > 4 and tokens[0].endswith('s') else tokens[0]
                query_pattern = f"%{target_word}%"
                
                div_clause = "AND division = ?" if division else ""
                div_params = (division,) if division else ()

                # Domain exclusion patterns to avoid attaching concrete/timber/gas/crane to steel, etc.
                incompatible_words = []
                p_title = (product_keyword or "").lower()
                if "steel" in p_title:
                    incompatible_words = ["concrete", "bamboo", "timber", "gas cylinder", "cylinder", "lpg", "crane", "paving", "rock", "valve"]
                elif "concrete" in p_title:
                    incompatible_words = ["timber", "bamboo", "gas cylinder", "cylinder", "crane", "ropeway"]
                elif any(w in p_title for w in ["pipe", "piping", "soil", "waste", "drainage", "sewerage", "plumbing", "water supply"]):
                    incompatible_words = [
                        "telecommunication", "telecommunications", "cable duct", "cable", "cables", 
                        "electrical", "gas cylinder", "cylinder", "footwear", "shoe", "shoes", 
                        "boot", "boots", "leather", "tape", "tapes"
                    ]

                if missing_facet == "testing":
                    cur.execute(f"""
                    SELECT family_id, raw_id, title_en, year, status, division,
                           'TEST_METHOD' as edge_type, 'INFERRED_LEXICAL' as provenance, 0.85 as confidence
                    FROM standards 
                    WHERE (title_en LIKE '%method%test%' OR title_en LIKE '%testing%')
                      AND title_en LIKE ?
                      {div_clause}
                    ORDER BY year DESC LIMIT 5;
                    """, (query_pattern, *div_params))
                elif missing_facet == "safety":
                    cur.execute(f"""
                    SELECT family_id, raw_id, title_en, year, status, division,
                           'SAFETY_STANDARD' as edge_type, 'INFERRED_LEXICAL' as provenance, 0.85 as confidence
                    FROM standards 
                    WHERE (title_en LIKE '%safety%' OR title_en LIKE '%protection%')
                      AND title_en LIKE ?
                      {div_clause}
                    ORDER BY year DESC LIMIT 5;
                    """, (query_pattern, *div_params))
                elif missing_facet == "installation":
                    cur.execute(f"""
                    SELECT family_id, raw_id, title_en, year, status, division,
                           'INSTALLATION_STANDARD' as edge_type, 'INFERRED_LEXICAL' as provenance, 0.85 as confidence
                    FROM standards 
                    WHERE (title_en LIKE '%code of practice%' OR title_en LIKE '%installation%' OR title_en LIKE '%maintenance%')
                      AND title_en LIKE ?
                      {div_clause}
                    ORDER BY year DESC LIMIT 5;
                    """, (query_pattern, *div_params))

                candidates = [dict(r) for r in cur.fetchall()]
                # Filter out obvious cross-domain incompatibilities
                valid_candidates = [
                    c for c in candidates
                    if not any(bad in c.get("title_en", "").lower() for bad in incompatible_words)
                ]
                discovered.extend(valid_candidates[:2])

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
            primary_div = primary_standard.get("division", "")
            for facet in missing:
                if facet in ["testing", "safety", "installation"]:
                    discovered = self.fetch_targeted_allied(family_id, product_name, facet, primary_division=primary_div)
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
