from typing import List, Dict, Any
from schemas.api import TenderHealthFinding, TenderClauseDetail

class TenderHealthService:
    def analyze_health(self, clauses: List[TenderClauseDetail]) -> List[TenderHealthFinding]:
        findings = []
        requirements_map = {}
        
        for clause in clauses:
            # Check missing units
            if clause.requirement and clause.value and not clause.unit and clause.requirement not in ["grade", "ip_rating"]:
                findings.append(TenderHealthFinding(
                    severity="HIGH",
                    category="MISSING_UNIT",
                    clause=clause.text,
                    message=f"Requirement '{clause.requirement}' has a value but is missing a unit.",
                    suggested_action="Specify standard unit (e.g., V, kW, Hz)."
                ))
                
            # Contradiction detection
            if clause.requirement and clause.value:
                if clause.requirement in requirements_map:
                    prev = requirements_map[clause.requirement]
                    if prev.value != clause.value:
                        findings.append(TenderHealthFinding(
                            severity="HIGH",
                            category="CONTRADICTION",
                            clause=f"'{prev.text}' VS '{clause.text}'",
                            message=f"Conflicting values for {clause.requirement}: {prev.value} vs {clause.value}",
                            suggested_action="Reconcile contradictory values in the tender document."
                        ))
                requirements_map[clause.requirement] = clause

        return findings
