from typing import List, Optional
from schemas.api import TenderHealthFinding, TenderClauseDetail, TenderHealthResponse
from services.audit_risk_service import AuditRiskService

class TenderHealthService:
    def __init__(self):
        self.audit_risk_service = AuditRiskService()

    def analyze_health(self, clauses: List[TenderClauseDetail]) -> List[TenderHealthFinding]:
        findings = []
        requirements_map = {}
        
        for clause in clauses:
            if not clause.requirement:
                continue
                
            # Check missing units
            if clause.value and not clause.unit and clause.requirement not in ["grade", "ip_rating"]:
                findings.append(TenderHealthFinding(
                    severity="WARNING",
                    category="MISSING_UNIT",
                    clause=clause.text,
                    message=f"Requirement '{clause.requirement}' has a value but is missing a unit.",
                    suggested_action="Specify standard unit (e.g., V, kW, Hz)."
                ))
                
            # Contradiction detection
            if clause.value:
                if clause.requirement in requirements_map:
                    prev = requirements_map[clause.requirement]
                    if prev.value != clause.value:
                        findings.append(TenderHealthFinding(
                            severity="ERROR",
                            category="CONTRADICTION",
                            clause=f"'{prev.text}' VS '{clause.text}'",
                            message=f"Conflicting values for {clause.requirement}: {prev.value} vs {clause.value}",
                            suggested_action="Reconcile contradictory values in the tender document."
                        ))
                requirements_map[clause.requirement] = clause

        return findings

    def get_full_report(
        self,
        clauses: List[TenderClauseDetail],
        raw_text: Optional[str] = None
    ) -> TenderHealthResponse:
        findings = self.analyze_health(clauses)
        clause_texts = [c.text for c in clauses if c.text]
        risk_report = self.audit_risk_service.audit_tender(
            tender_text=raw_text,
            clauses=clause_texts
        )
        return TenderHealthResponse(
            findings=findings,
            dispute_risk_report=risk_report
        )
