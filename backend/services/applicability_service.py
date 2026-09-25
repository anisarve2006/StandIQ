from typing import Dict, Any, List
from schemas.domain import Requirement, ApplicabilityResult, ApplicabilityStatus, RequirementCategory
from retrieval.constraint_engine import ConstraintEngine

class ApplicabilityService:
    def __init__(self):
        self.constraint_engine = ConstraintEngine()

    def evaluate_requirement(self, requirement: Requirement, standard: Dict[str, Any]) -> ApplicabilityResult:
        # Map requirement to query constraints
        query_constraints = {}
        
        req_name = requirement.name.lower()
        if requirement.normalized_value is not None:
            if "voltage" in req_name:
                query_constraints["voltage"] = {"value": requirement.normalized_value, "unit": requirement.unit}
            elif "power" in req_name:
                query_constraints["power"] = {"value": requirement.normalized_value, "unit": requirement.unit}
            elif "frequency" in req_name:
                query_constraints["frequency"] = {"value": requirement.normalized_value, "unit": requirement.unit}
                
        if requirement.category == RequirementCategory.ENVIRONMENT and requirement.expected_value:
            query_constraints["environment"] = requirement.expected_value.lower()
        if requirement.category == RequirementCategory.MATERIAL and requirement.expected_value:
            query_constraints["grade"] = requirement.expected_value
            
        # Delegate to core ConstraintEngine
        result = self.constraint_engine.verify_candidate(standard, query_constraints)
        
        status = ApplicabilityStatus.UNKNOWN
        reason = "Requirement could not be verified."
        
        if result["is_compatible"] and not result["conflicts"]:
            if result["technical_matches"]:
                status = ApplicabilityStatus.SATISFIES
                reason = "; ".join(result["technical_matches"])
        elif not result["is_compatible"] or result["conflicts"]:
            status = ApplicabilityStatus.VIOLATES
            reason = "; ".join(result["conflicts"])
            
        return ApplicabilityResult(
            requirement=requirement,
            standard=standard,
            status=status,
            reason=reason
        )
