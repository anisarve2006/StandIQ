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
        # Generate specific, deterministic questions based on core parameters
        if "environment" not in constraints:
            questions.append("What operating temperature range and environment (indoor/outdoor) should the equipment support?")
        if "voltage" not in constraints:
            questions.append("What operating voltage is required for the installation?")
        if "power" not in constraints:
            questions.append("What is the required power rating (e.g., kW, HP)?")
        if "grade" not in constraints:
            questions.append("What material grade is required?")
            
        return CompletenessResponse(
            covered=covered,
            partial=partial,
            missing=missing,
            clarifying_questions=questions
        )
