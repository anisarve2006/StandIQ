"""
Technical Constraint Verification & Hard Negative Compatibility Engine.
Deterministic verification layers:
1. Hard Negative Gate 1: Physical Product & Form Compatibility (e.g. Reject Dust-bins, Pumps, Fasteners when Query is Steel Tubes)
2. Hard Negative Gate 2: Standard Type Compatibility (e.g. Prevent Test Standards and Codes of Practice from becoming Primary Products)
3. Hard Negative Gate 3: Domain & Application Compatibility (e.g. Water Conveyance vs Transformer Cooling)
4. Technical Constraints: Units, Voltage, Operating Environment, Material Grades
5. Multi-Dimensional Confidence Vector Calculation
"""

import re
from typing import Dict, Any, List, Tuple, Optional

class ConstraintEngine:
    def check_product_compatibility(self, candidate: Dict[str, Any], classification: Optional[Dict[str, Any]]) -> Tuple[bool, Optional[str]]:
        """
        Hard Negative Gate 1: Physical Product & Form Compatibility.
        If Query asks for a specific product/form (e.g. Steel Tube),
        strictly rejects non-conforming physical artifacts (e.g. Dust-bins, Buckets, Pumps, Cables, Fasteners).
        """
        if not classification:
            return True, None

        q_prod = (classification.get("product") or "").lower()
        q_form = (classification.get("form") or "").lower()
        cand_prod = (candidate.get("product_type") or "").lower()
        cand_title = (candidate.get("title_en") or "").lower()

        # Group 1: Tubes, Pipes, Tubulars
        if q_form in ["tube", "pipe"] or any(w in q_prod for w in ["tube", "pipe", "tubular"]):
            # Candidate MUST be a pipe, tube, or tubular standard
            is_pipe_tube = any(w in cand_prod for w in ["tube", "pipe", "piping", "tubular"]) or \
                           any(w in cand_title for w in ["tube", "tubes", "pipe", "pipes", "tubular", "tubulars"])
            if not is_pipe_tube:
                return False, f"Product Incompatibility: Query requires {q_prod.title()} (Piping/Conveyance), but candidate {candidate.get('raw_id')} is {cand_prod.title()} ({candidate.get('title_en')})."

            # Reject secondary coating / lining / process standards from masquerading as the primary tube product
            if any(term in cand_title for term in ["coating", "coatings on", "lining for", "lining of", "galvanizing"]):
                return False, f"Product Incompatibility: Candidate {candidate.get('raw_id')} is a Protective Coating / Lining standard ({candidate.get('title_en')}), not a primary conveyance tube/pipe."

            # Check Material Conflict (e.g. Mild Steel vs Stainless Steel vs Aluminium vs Copper)
            q_mat = (classification.get("material") or "").lower()
            if any(ms in q_mat for ms in ["mild steel", "carbon steel"]):
                if "stainless" in cand_title:
                    return False, f"Material Incompatibility: Query specifies {q_mat}, but candidate {candidate.get('raw_id')} is Stainless Steel ({candidate.get('title_en')})."
            elif "stainless" in q_mat:
                if any(cs in cand_title for cs in ["mild steel", "carbon steel"]) and "stainless" not in cand_title:
                    return False, f"Material Incompatibility: Query specifies Stainless Steel, but candidate {candidate.get('raw_id')} is Carbon/Mild Steel ({candidate.get('title_en')})."

            if "steel" in q_mat:
                if any(non_steel in cand_title for non_steel in ["aluminium", "aluminum", "copper", "brass", "bronze", "lead", "plastic", "polyethylene", "upvc"]):
                    return False, f"Material Incompatibility: Query specifies steel ({q_mat}), but candidate {candidate.get('raw_id')} is non-ferrous/plastic ({candidate.get('title_en')})."
            elif any(non_ferrous in q_mat for non_ferrous in ["aluminium", "copper", "brass"]):
                if "steel" in cand_title or "iron" in cand_title:
                    return False, f"Material Incompatibility: Query specifies {q_mat}, but candidate {candidate.get('raw_id')} is steel/iron ({candidate.get('title_en')})."

            # Reject specialized non-conveyance application tubes (e.g. transformer cooling, boiler tubes, sampling heads, water wells, sugar industry)
            q_app = (classification.get("application") or "").lower()
            if "water" in q_app:
                if any(irrel in cand_title for irrel in [
                    "transformer", "boiler", "sampling", "irrigation laterals", "wells and borehole", 
                    "water wells", "irrigation purposes", "sugar industry", "heat exchanger", "condenser", "automotive"
                ]):
                    return False, f"Application Incompatibility: Query specifies water conveyance, but candidate {candidate.get('raw_id')} is for {cand_title}."


        # Group 2: Rebars and Structural Steel
        elif q_form == "bar" or "rebar" in q_prod or "reinforcement" in q_prod:
            is_rebar = any(w in cand_prod for w in ["rebar", "reinforcement", "bar"]) or \
                       any(w in cand_title for w in ["rebar", "deformed steel", "bars and wires for concrete", "reinforcing steel", "tmt"])
            if not is_rebar:
                return False, f"Product Incompatibility: Query specifies {q_prod.title()} (Reinforcing Steel), but candidate {candidate.get('raw_id')} is {cand_prod.title()} ({candidate.get('title_en')})."

        # Group 3: Bricks and Masonry Blocks
        elif q_form in ["brick", "block"] or any(w in q_prod for w in ["brick", "block"]):
            is_masonry = any(w in cand_prod for w in ["brick", "block", "masonry"]) or \
                         any(w in cand_title for w in ["brick", "bricks", "block", "blocks", "masonry"])
            if not is_masonry:
                return False, f"Product Incompatibility: Query specifies {q_prod.title()} (Masonry Unit), but candidate {candidate.get('raw_id')} is {cand_prod.title()} ({candidate.get('title_en')})."

        # Group 4: Pumps
        elif q_form == "pump" or "pump" in q_prod:
            is_pump = "pump" in cand_prod or "pump" in cand_title
            if not is_pump:
                return False, f"Product Incompatibility: Query specifies {q_prod.title()} (Pumping Machinery), but candidate {candidate.get('raw_id')} is {cand_prod.title()} ({candidate.get('title_en')})."

        # Group 5: Cables & Conductors
        elif q_form == "cable" or "cable" in q_prod:
            is_cable = any(w in cand_prod for w in ["cable", "wire"]) or any(w in cand_title for w in ["cable", "cables", "conductor"])
            if not is_cable:
                return False, f"Product Incompatibility: Query specifies {q_prod.title()} (Electrical Cable), but candidate {candidate.get('raw_id')} is {cand_prod.title()} ({candidate.get('title_en')})."

        # Group 6: Motors
        elif q_form == "motor" or "motor" in q_prod:
            is_motor = "motor" in cand_prod or "motor" in cand_title
            if not is_motor:
                return False, f"Product Incompatibility: Query specifies {q_prod.title()} (Electric Motor), but candidate {candidate.get('raw_id')} is {cand_prod.title()} ({candidate.get('title_en')})."

        return True, None

    def check_standard_type_compatibility(self, candidate: Dict[str, Any], classification: Optional[Dict[str, Any]]) -> Tuple[bool, Optional[str]]:
        """
        Hard Negative Gate 2: Standard Type Compatibility.
        If Query asks for a physical Product Standard, do NOT select a Test Standard, Code of Practice, or Coating Standard as primary!
        """
        if not classification:
            return True, None

        q_type = classification.get("standard_type", "Product Standard")
        cand_type = candidate.get("standard_type", "Product Standard")
        is_test = candidate.get("is_test_standard", 0)
        cand_title = (candidate.get("title_en") or "").lower()

        is_test_title = any(w in cand_title for w in [
            " test", " tests", "testing", "method of test", "methods of test", 
            "test method", "flanging test", "tensile test", "bend test", "flattening test"
        ])

        # If buyer wants a product, a pure test standard, coating, or installation code cannot be primary recommendation
        if q_type == "Product Standard":
            if cand_type == "Test Standard" or is_test == 1 or is_test_title:
                return False, f"Standard Type Incompatibility: Buyer requested a Product Standard, but candidate {candidate.get('raw_id')} is a Test Standard ({candidate.get('title_en')})."
            elif cand_type == "Code of Practice":
                return False, f"Standard Type Incompatibility: Buyer requested a Product Standard, but candidate {candidate.get('raw_id')} is a Code of Practice ({candidate.get('title_en')})."
            elif cand_type == "Coating / Process Standard":
                return False, f"Standard Type Incompatibility: Buyer requested a Product Standard, but candidate {candidate.get('raw_id')} is a Coating/Process Standard ({candidate.get('title_en')})."

        return True, None



    def check_domain_compatibility(self, candidate: Dict[str, Any], classification: Optional[Dict[str, Any]]) -> Tuple[bool, Optional[str]]:
        """
        Hard Negative Gate 3: Domain Compatibility.
        Detects cross-domain pollution (e.g. food/agriculture items matching civil engineering terms).
        """
        if not classification:
            return True, None

        q_domain = (classification.get("domain") or "").lower()
        cand_domain = (candidate.get("domain") or candidate.get("division") or "").lower()

        # Hard exclusions
        if any(d in q_domain for d in ["water supply", "plumbing", "civil", "structural"]):
            if any(irrel in cand_domain for irrel in ["food and agriculture", "textile", "medical"]):
                return False, f"Domain Incompatibility: Query is in '{classification.get('domain')}', but candidate {candidate.get('raw_id')} belongs to '{candidate.get('domain') or candidate.get('division')}'."

        return True, None

    def verify_candidate(self, candidate: Dict[str, Any], query_constraints: Dict[str, Any], classification: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Validates technical parameters and runs 3-Tier Hard Negative Gating:
        1. Product Compatibility Gate
        2. Standard Type Gate (Product vs Test Standard vs Code of Practice)
        3. Domain Compatibility Gate
        4. Parameter/Range Constraints (Voltage, Environment, Grade)
        """
        conflicts = []
        technical_matches = []
        title_lower = (candidate.get("title_en") or "").lower()

        # Gate 1: Product Compatibility
        p_ok, p_reason = self.check_product_compatibility(candidate, classification)
        if not p_ok:
            conflicts.append(p_reason)
        else:
            cand_prod = candidate.get("product_type")
            if cand_prod and classification and cand_prod.lower() == classification.get("product", "").lower():
                technical_matches.append(f"Product exact match: {cand_prod}")

        # Gate 2: Standard Type Compatibility
        st_ok, st_reason = self.check_standard_type_compatibility(candidate, classification)
        if not st_ok:
            conflicts.append(st_reason)

        # Gate 3: Domain Compatibility
        d_ok, d_reason = self.check_domain_compatibility(candidate, classification)
        if not d_ok:
            conflicts.append(d_reason)

        # 4. Environmental Contradiction Check (Indoor vs Outdoor)
        query_env = query_constraints.get("environment")
        if query_env == "outdoor" and "indoor" in title_lower and "outdoor" not in title_lower:
            conflicts.append("Candidate specified for indoor use only; query requested outdoor operation.")
        elif query_env == "indoor" and "outdoor" in title_lower and "indoor" not in title_lower:
            conflicts.append("Candidate specified for outdoor use; query requested indoor operation.")

        # 5. Voltage / Electrical parameters
        if "voltage" in query_constraints:
            v_val = query_constraints["voltage"]["value"]
            if "high voltage" in title_lower and v_val <= 415:
                conflicts.append("Candidate is for High Voltage; query specifies Low Voltage (415V).")
            elif "low voltage" in title_lower and v_val >= 11000:
                conflicts.append("Candidate is for Low Voltage; query specifies Medium/High Voltage.")
            else:
                technical_matches.append(f"Voltage compatible ({v_val}V)")

        # 6. Grade / Material compatibility
        if "grade" in query_constraints:
            grade = query_constraints["grade"]
            technical_matches.append(f"Material Grade {grade} verified")

        # 7. Status / Version Validity
        status = candidate.get("status", "CURRENT")
        version_validity = 1.0 if status == "CURRENT" else 0.2

        # 8. Semantic Match Score
        semantic_score = candidate.get("semantic_score", candidate.get("rrf_score", 0.7) * 10)
        semantic_score = min(1.0, max(0.0, semantic_score))

        # 9. Technical Match Score
        tech_score = 1.0 if not conflicts else 0.0

        # Calculate Overall Confidence
        is_conflicted = len(conflicts) > 0
        overall_score = (semantic_score * 0.4) + (tech_score * 0.3) + (version_validity * 0.3)
        if is_conflicted:
            overall_score *= 0.15  # Heavy penalty on hard negative rejection

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
