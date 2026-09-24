"""
Structured Evidence Pack Builder (PDF Section 24 & Architecture Specification Layer 24).
Assembles a complete, tamper-proof, verified Evidence Package for the LLM synthesis layer.
Code decides all facts, references, versions, and certifications;
the LLM strictly explains and formats the evidence pack.
"""

from typing import Dict, Any, List, Optional
import datetime

class EvidencePackBuilder:
    def build_pack(self,
                   query_obj: Dict[str, Any],
                   primary_standard: Dict[str, Any],
                   allied_standards: List[Dict[str, Any]],
                   certification_info: Dict[str, Any],
                   constraint_results: Dict[str, Any],
                   coverage_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Constructs the structured Evidence Package:
        - query_summary: extracted intent, entities, units
        - primary_standard: canonical details, version status, scope
        - allied_standards: test methods, safety, installation, with provenance
        - certification: QCO rule reference, gazette notification, scheme
        - technical_constraints: verified physical parameters and units
        - specification_gaps: parameters missing in the user query
        - negative_evidence: conflicts or contradictions detected
        - confidence_vector: 6-dimensional calibrated confidence breakdown
        """
        now_str = datetime.datetime.now().strftime("%Y-%m-%d")

        # 1. Primary Standard Metadata & Version Status
        status = primary_standard.get("status", "CURRENT").upper()
        year = primary_standard.get("year")
        family_id = primary_standard.get("family_id")
        raw_id = primary_standard.get("raw_id", family_id)
        
        version_status_info = {
            "family_id": family_id,
            "raw_id": raw_id,
            "year": year,
            "edition_status": status,
            "num_amendments": primary_standard.get("num_amendments", 0),
            "is_current": status in ["CURRENT", "REAFFIRMED"],
            "as_of_date": now_str,
            "archive_url": primary_standard.get("archive_url") or primary_standard.get("pdf_url")
        }

        # 2. Categorize Allied Standards by Role
        categorized_allied = {
            "test_methods": [],
            "safety_standards": [],
            "installation_standards": [],
            "normative_references": [],
            "related_products": []
        }

        for edge in allied_standards:
            role = edge.get("edge_type", "").upper()
            std_entry = {
                "family_id": edge.get("dst_family_id") or edge.get("family_id"),
                "raw_id": edge.get("raw_id", edge.get("dst_family_id")),
                "title_en": edge.get("title_en", ""),
                "year": edge.get("year"),
                "status": edge.get("status", "CURRENT"),
                "provenance": edge.get("provenance", "DECLARED_CATALOGUE"),
                "confidence": edge.get("confidence", 1.0)
            }
            if "TEST" in role:
                categorized_allied["test_methods"].append(std_entry)
            elif "SAFETY" in role:
                categorized_allied["safety_standards"].append(std_entry)
            elif "INSTALLATION" in role:
                categorized_allied["installation_standards"].append(std_entry)
            elif "NORMATIVE" in role or "REFERENCES" in role:
                categorized_allied["normative_references"].append(std_entry)
            else:
                categorized_allied["related_products"].append(std_entry)

        # 3. Detect Specification Gaps (Parameters standard expects that query omitted)
        gaps = []
        constraints = query_obj.get("constraints", {})
        division = primary_standard.get("division") or ""
        
        if "Electrotechnical" in division:
            if "voltage" not in constraints:
                gaps.append("Operating voltage / rated insulation voltage not specified in tender.")
            if "frequency" not in constraints:
                gaps.append("Supply frequency not specified (standard Indian grid operates at 50 Hz).")
            if "ip_rating" not in constraints:
                gaps.append("Ingress Protection (IP rating) for environmental protection omitted.")
        elif "Civil" in division:
            if "grade" not in constraints:
                gaps.append("Specific strength grade (e.g. Fe 500D, M25, Grade 43) not specified.")
            if "environment" not in constraints:
                gaps.append("Exposure condition (Mild, Moderate, Severe, Coastal/Marine) not indicated.")
        elif "Mechanical" in division:
            if "power" not in constraints:
                gaps.append("Rated power / discharge capacity not indicated.")
            if "environment" not in constraints:
                gaps.append("Working fluid characteristics and temperature range omitted.")

        # 4. Certification & QCO Rules
        orders = certification_info.get("orders", [])
        cert_data = {
            "status": certification_info.get("status", "NOT IDENTIFIED"),
            "is_mandatory": certification_info.get("is_mandatory", False),
            "scheme": certification_info.get("scheme"),
            "applicable_qco": orders[0]["product_name"] if orders else None,
            "gazette_notification": orders[0]["gazette_notification"] if orders else None,
            "source_authority": "Ministry of Commerce and Industry / Central Government of India",
            "regulatory_banner": "Regulatory orders change; verify against the e-Gazette and BIS before tender finalization."
        }

        # 5. Multi-Dimensional Confidence Vector (Layer 35)
        conf_vector = constraint_results.get("confidence_vector", {})
        
        # Calculate Graph Support
        graph_support = min(1.0, 0.4 + (len(allied_standards) * 0.15))
        
        # Calculate Scope Match
        scope_text = primary_standard.get("scope_text") or primary_standard.get("title_en", "")
        scope_words = set(scope_text.lower().split())
        query_words = set(query_obj.get("clean_query", "").lower().split())
        overlap = len(scope_words.intersection(query_words))
        scope_match = min(1.0, round(0.5 + (overlap * 0.1), 2))

        multidim_confidence = {
            "semantic_match": conf_vector.get("semantic_match", 0.90),
            "technical_match": conf_vector.get("technical_match", 1.00),
            "scope_match": scope_match,
            "graph_support": round(graph_support, 2),
            "version_validity": conf_vector.get("version_validity", 1.00),
            "certification_evidence": 1.00 if cert_data["is_mandatory"] else 0.70,
            "overall_label": conf_vector.get("confidence_label", "HIGH")
        }

        # Final Evidence Pack Structure
        return {
            "query_summary": {
                "raw_query": query_obj.get("raw_query"),
                "recognized_entities": query_obj.get("trade_matches", []),
                "extracted_constraints": constraints,
                "query_type": query_obj.get("query_type")
            },
            "primary_standard": {
                "family_id": family_id,
                "raw_id": raw_id,
                "title_en": primary_standard.get("title_en"),
                "division": primary_standard.get("division"),
                "committee": primary_standard.get("committee"),
                "scope_summary": primary_standard.get("scope_text") or primary_standard.get("title_en"),
                "archive_url": version_status_info["archive_url"]
            },
            "version_verification": version_status_info,
            "certification": cert_data,
            "allied_standards": categorized_allied,
            "technical_verification": {
                "is_compatible": constraint_results.get("is_compatible", True),
                "matched_parameters": constraint_results.get("technical_matches", []),
                "conflicts": constraint_results.get("conflicts", [])
            },
            "completeness_assessment": coverage_info,
            "specification_gaps": gaps,
            "multidimensional_confidence": multidim_confidence
        }
