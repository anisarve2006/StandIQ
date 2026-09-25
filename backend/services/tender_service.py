from typing import Dict, Any, List, Union
import re
from retrieval.compiler import extract_units_and_numbers, compile_query
from retrieval.pdf_processor import TenderPDFProcessor
from schemas.api import TenderClauseDetail, TenderAnalyzeResponse

class TenderService:
    def __init__(self):
        self.pdf_processor = TenderPDFProcessor()

    def analyze_input(self, payload: Union[str, bytes]) -> TenderAnalyzeResponse:
        clauses = []
        if isinstance(payload, bytes) or (isinstance(payload, str) and payload.lower().endswith(".pdf")):
            # It's a PDF payload
            # pdf_processor takes bytes or file path
            result = self.pdf_processor.extract_document(payload)
            items = result.get("extracted_items", [])
            for i, item in enumerate(items):
                raw_text = item.get("raw_text", "")
                constraints = extract_units_and_numbers(raw_text)
                compiled = compile_query(raw_text)
                
                clause = TenderClauseDetail(
                    clause_id=str(i+1),
                    text=raw_text,
                    category="PRODUCT" if not constraints else "TECHNICAL",
                    referenced_standard=compiled.get("exact_is")[0]["raw_id"] if compiled.get("exact_is") else None,
                    source_location=item.get("source", f"Item {i+1}")
                )
                
                if constraints:
                    # Extract constraints cleanly
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
        else:
            # Plain text payload
            text = payload
            lines = [line.strip() for line in text.split('\n') if line.strip()]
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

    def analyze_text(self, text: str) -> TenderAnalyzeResponse:
        return self.analyze_input(text)
