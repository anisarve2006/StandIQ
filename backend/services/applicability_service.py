import re
from typing import Dict, Any, List
from schemas.domain import Requirement, ApplicabilityResult, ApplicabilityStatus, RequirementCategory
from retrieval.constraint_engine import ConstraintEngine

class ApplicabilityService:
    def __init__(self):
        self.constraint_engine = ConstraintEngine()

    def _parse_operator(self, text: str) -> str:
        text = text.strip()
        if text.startswith(">="): return ">="
        if text.startswith("<="): return "<="
        if text.startswith(">"): return ">"
        if text.startswith("<"): return "<"
        if "between" in text.lower(): return "between"
        return "="

    def evaluate_requirement(self, requirement: Requirement, standard: Dict[str, Any]) -> ApplicabilityResult:
        query_constraints = {}
        req_name = requirement.name.lower()
        operator = self._parse_operator(requirement.source_text)
        
        if requirement.normalized_value is not None:
            constraint_dict = {
                "value": requirement.normalized_value, 
                "unit": requirement.unit,
                "operator": operator
            }
            if "voltage" in req_name:
                query_constraints["voltage"] = constraint_dict
            elif "power" in req_name:
                query_constraints["power"] = constraint_dict
            elif "frequency" in req_name:
                query_constraints["frequency"] = constraint_dict
                
        if requirement.category == RequirementCategory.ENVIRONMENT and requirement.expected_value:
            query_constraints["environment"] = str(requirement.expected_value).lower()
        if requirement.category == RequirementCategory.MATERIAL and requirement.expected_value:
            query_constraints["grade"] = str(requirement.expected_value)
            
        if not query_constraints:
            return ApplicabilityResult(
                requirement=requirement,
                standard=standard,
                status=ApplicabilityStatus.UNKNOWN,
                reason="Requirement constraint not supported or unrecognized."
            )
            
        # Delegate to constraint engine for text-based checks
        result = self.constraint_engine.verify_candidate(standard, query_constraints)
        
        status = ApplicabilityStatus.UNKNOWN
        reason = "Requirement could not be completely verified against the standard."
        
        # Add numeric operator validation on top of the constraint engine
        numeric_conflicts = []
        numeric_matches = []
        
        # In a real environment, the standard would have structured attributes to compare against.
        # Since standard is a dict from SQLite, it might not have numeric bounds. 
        # If it doesn't, we fallback to UNKNOWN unless the constraint engine found a semantic match.
        std_voltage = standard.get("max_voltage") or standard.get("voltage")
        if std_voltage is not None and "voltage" in query_constraints:
            req_val = requirement.normalized_value
            try:
                std_v = float(std_voltage)
                if operator == ">=" and std_v < req_val:
                    numeric_conflicts.append(f"Standard supports up to {std_v}V, required >= {req_val}V")
                elif operator == "<=" and std_v > req_val:
                    numeric_conflicts.append(f"Standard minimum is {std_v}V, required <= {req_val}V")
                else:
                    numeric_matches.append(f"Voltage requirement ({operator} {req_val}V) met by standard ({std_v}V)")
            except ValueError:
                pass
                
        if result["is_compatible"] and not result["conflicts"] and not numeric_conflicts:
            if numeric_matches or result["technical_matches"]:
                status = ApplicabilityStatus.SATISFIES
                reason = "; ".join(numeric_matches + result["technical_matches"])
            else:
                status = ApplicabilityStatus.UNKNOWN
        elif not result["is_compatible"] or result["conflicts"] or numeric_conflicts:
            status = ApplicabilityStatus.VIOLATES
            reason = "; ".join(numeric_conflicts + result["conflicts"])
            
        return ApplicabilityResult(
            requirement=requirement,
            standard=standard,
            status=status,
            reason=reason
        )
