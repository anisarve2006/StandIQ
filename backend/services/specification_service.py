from typing import Dict, Any, List
from schemas.domain import Requirement
from schemas.api import SpecificationGenerateResponse

class SpecificationService:
    def generate_specification(self, requirements: List[Requirement], standards: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> SpecificationGenerateResponse:
        lines = []
        lines.append("### GENERATED TENDER SPECIFICATION CLAUSE")
        lines.append("")
        
        # Standards
        if standards:
            stds = ", ".join([s.get("raw_id", s.get("family_id", "Unknown")) for s in standards])
            lines.append(f"**Governing Standards:** The goods shall strictly conform to {stds}.")
            
        # Requirements
        if requirements:
            lines.append("**Technical Requirements:**")
            for req in requirements:
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
                    
        return SpecificationGenerateResponse(
            specification_clause="\n".join(lines)
        )
