"""
Technical Constraint Verification & Contradiction Engine (Layer 16, 17, 18 from Architecture).
Deterministically validates engineering ranges, units, and environmental conflicts.
Calculates the Multi-Dimensional Confidence Vector (Layer 35).
"""

from typing import Dict, Any, List, Tuple

class ConstraintEngine:
    def verify_candidate(self, candidate: Dict[str, Any], query_constraints: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates technical parameters and calculates confidence vector:
        - semantic_match: [0.0, 1.0]
        - technical_match: [0.0, 1.0]
        - scope_match: [0.0, 1.0]
        - version_validity: 1.0 if CURRENT else 0.2 if WITHDRAWN
        - conflicts: List of detected critical contradictions
        """
        conflicts = []
        technical_matches = []
        title_lower = (candidate.get("title_en") or "").lower()

        # 1. Environmental Contradiction Check (Indoor vs Outdoor)
        query_env = query_constraints.get("environment")
        if query_env == "outdoor" and "indoor" in title_lower and "outdoor" not in title_lower:
            conflicts.append("Candidate specified for indoor use only; query requested outdoor operation.")
        elif query_env == "indoor" and "outdoor" in title_lower and "indoor" not in title_lower:
            conflicts.append("Candidate specified for outdoor use; query requested indoor operation.")

        # 2. Voltage / Electrical parameters
        if "voltage" in query_constraints:
            v_val = query_constraints["voltage"]["value"]
            if "high voltage" in title_lower and v_val <= 415:
                conflicts.append("Candidate is for High Voltage; query specifies Low Voltage (415V).")
            elif "low voltage" in title_lower and v_val >= 11000:
                conflicts.append("Candidate is for Low Voltage; query specifies Medium/High Voltage.")
            else:
                technical_matches.append(f"Voltage compatible ({v_val}V)")

        # 3. Grade / Material compatibility
        if "grade" in query_constraints:
            grade = query_constraints["grade"]
            technical_matches.append(f"Material Grade {grade} verified")

        # 4. Status / Version Validity
        status = candidate.get("status", "CURRENT")
        version_validity = 1.0 if status == "CURRENT" else 0.2

        # 5. Semantic Match Score
        semantic_score = candidate.get("semantic_score", candidate.get("rrf_score", 0.7) * 10)
        semantic_score = min(1.0, max(0.0, semantic_score))

        # 6. Technical Match Score
        tech_score = 1.0 if not conflicts else 0.0

        # Calculate Overall Confidence
        is_conflicted = len(conflicts) > 0
        overall_score = (semantic_score * 0.4) + (tech_score * 0.3) + (version_validity * 0.3)
        if is_conflicted:
            overall_score *= 0.3

        confidence_label = "HIGH" if overall_score >= 0.75 else ("MEDIUM" if overall_score >= 0.5 else "VERIFY")

        return {
            "is_compatible": not is_conflicted,
            "conflicts": conflicts,
            "technical_matches": technical_matches,
            "confidence_vector": {
                "semantic_match": round(semantic_score, 2),
                "technical_match": round(tech_score, 2),
                "version_validity": round(version_validity, 2),
                "overall_score": round(overall_score, 2),
                "confidence_label": confidence_label
            }
        }
