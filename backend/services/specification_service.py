from typing import Dict, Any, List
from schemas.domain import Requirement
from schemas.api import SpecificationGenerateResponse

class SpecificationService:
    def generate_specification(self, requirements: List[Requirement], standards: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> SpecificationGenerateResponse:
        lines = []
        
        # If there are no standards or evidence, we cannot generate a grounded specification.
        if not standards:
            return SpecificationGenerateResponse(specification_clause="UNKNOWN: No standards selected for specification generation.")

        # Attempt high-fidelity clause drafting using sovereign BharatGPT (Modal Serverless or Local)
        try:
            from services.bharatgpt_service import bharatgpt_engine
            if bharatgpt_engine and bharatgpt_engine.is_available():
                primary = standards[0]
                std_id = primary.get("raw_id", primary.get("family_id", "IS Standard"))
                std_title = primary.get("title_en", std_id)
                param_dict = {}
                for req in (requirements or []):
                    if req.name and (req.expected_value or req.normalized_value):
                        param_dict[req.name] = req.normalized_value or req.expected_value
                cert_ev = [e.get("source", "QCO") for e in (evidence or []) if e.get("evidence_type") == "CERTIFICATION"]
                cert_info = ", ".join(cert_ev) if cert_ev else "Standard Quality Compliance"
                clause = bharatgpt_engine.draft_specification_clause(
                    product_name=std_title,
                    standard_id=std_id,
                    standard_title=std_title,
                    parameters=param_dict,
                    certification_info=cert_info
                )
                if clause and len(clause) > 15:
                    return SpecificationGenerateResponse(specification_clause=clause)
        except Exception:
            pass

        lines.append("### GENERATED TENDER SPECIFICATION CLAUSE")
        lines.append("")
        
        # Standards
        stds = ", ".join([s.get("raw_id", s.get("family_id", "Unknown")) for s in standards])
        lines.append(f"**Governing Standards:** The goods shall strictly conform to {stds}.")
            
        # Requirements
        if requirements:
            lines.append("**Technical Requirements:**")
            for req in requirements:
                # Do not invent requirements that lack evidence or expected values
                if not req.expected_value and not req.normalized_value:
                    continue
                unit_str = f" {req.unit}" if req.unit else ""
                val_str = f"{req.normalized_value}{unit_str}" if req.normalized_value else str(req.expected_value)
                lines.append(f"- {req.name.capitalize()}: {val_str}")
                
        # Certification/Evidence
        if evidence:
            cert_evidence = [e for e in evidence if e.get("evidence_type") == "CERTIFICATION"]
            if cert_evidence:
                lines.append("**Certification Requirements:**")
                for c in cert_evidence:
                    lines.append(f"- Compliance with {c.get('source', 'applicable QCO')} is mandatory.")
            
            # Grounding
            lines.append("\n*Generated from verified standard evidence.*")
        else:
            lines.append("\n*Note: Specification generated without explicit evidence packs. Verification required.*")
                    
        return SpecificationGenerateResponse(
            specification_clause="\n".join(lines)
        )
