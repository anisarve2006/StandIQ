from typing import Dict, Any, List
from schemas.api import CompletenessResponse

class CompletenessService:
    def get_completeness_report(self, coverage_info: Dict[str, Any], constraints: Dict[str, Any]) -> CompletenessResponse:
        covered = []
        missing = []
        partial = []
        
        facets = coverage_info.get("facets", {})
        for k, v in facets.items():
            if v:
                covered.append(k.upper())
            else:
                missing.append(k.upper())
                
        questions = []
        
        # Clarifying questions based on missing requirements/constraints
        # This matches the user request for deterministic questions based on missing requirements
        if "environment" not in constraints:
            questions.append("Is the equipment intended for indoor or outdoor installation?")
        if "voltage" not in constraints:
            questions.append("What operating voltage should be supported?")
        if "grade" not in constraints:
            questions.append("What material grade is required?")
            
        return CompletenessResponse(
            covered=covered,
            partial=partial,
            missing=missing,
            clarifying_questions=questions
        )
