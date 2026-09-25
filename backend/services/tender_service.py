from typing import Dict, Any, List
import re
from retrieval.compiler import extract_units_and_numbers, compile_query
from retrieval.pdf_processor import TenderPDFProcessor
from schemas.api import TenderClauseDetail, TenderAnalyzeResponse

class TenderService:
    def __init__(self):
        self.pdf_processor = TenderPDFProcessor()

    def analyze_text(self, text: str) -> TenderAnalyzeResponse:
        # Simple line-by-line decomposition if plain text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        clauses = []
        for i, line in enumerate(lines):
            constraints = extract_units_and_numbers(line)
            compiled = compile_query(line)
            
            clause = TenderClauseDetail(
                clause_id=str(i+1),
                text=line,
                category="PRODUCT" if not constraints else "TECHNICAL",
                referenced_standard=compiled.get("exact_is")[0]["raw_id"] if compiled.get("exact_is") else None,
                source_location=f"Line {i+1}"
            )
            # Just extract one unit for the API structure
            if constraints:
                key = list(constraints.keys())[0]
                val = constraints[key]
                if isinstance(val, dict):
                    clause.requirement = key
                    clause.value = str(val.get("value"))
                    clause.unit = val.get("unit")
                else:
                    clause.requirement = key
                    clause.value = str(val)
            
            clauses.append(clause)
            
        return TenderAnalyzeResponse(
            clauses=clauses,
            recommendations={}
        )
