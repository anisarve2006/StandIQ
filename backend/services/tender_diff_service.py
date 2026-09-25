from typing import List, Dict, Any
from schemas.api import TenderDiffResponse
from services.tender_service import TenderService

class TenderDiffService:
    def __init__(self):
        self.tender_service = TenderService()

    def compare_tenders(self, version_a_text: str, version_b_text: str) -> TenderDiffResponse:
        a_result = self.tender_service.analyze_text(version_a_text)
        b_result = self.tender_service.analyze_text(version_b_text)
        
        a_lines = [c.text for c in a_result.clauses]
        b_lines = [c.text for c in b_result.clauses]
        
        a_reqs = {c.requirement: c for c in a_result.clauses if c.requirement}
        b_reqs = {c.requirement: c for c in b_result.clauses if c.requirement}
        
        added = [text for text in b_lines if text not in a_lines]
        removed = [text for text in a_lines if text not in b_lines]
        modified = []
        changed_tech = []
        
        for req, b_clause in b_reqs.items():
            if req in a_reqs:
                a_clause = a_reqs[req]
                if a_clause.value != b_clause.value:
                    changed_tech.append({
                        "requirement": req,
                        "old_value": a_clause.value,
                        "new_value": b_clause.value
                    })
                    modified.append({
                        "old_clause": a_clause.text,
                        "new_clause": b_clause.text
                    })
                    
        return TenderDiffResponse(
            added_clauses=added,
            removed_clauses=removed,
            modified_clauses=modified,
            changed_technical_values=changed_tech,
            changed_standards=[]
        )
