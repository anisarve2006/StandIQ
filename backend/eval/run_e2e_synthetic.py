import os
import json
from schemas.api import StandardRecommendationRequest
from api_service import engine, tender_service, specification_service
from services.applicability_service import ApplicabilityService
from retrieval.compiler import extract_units_and_numbers

def run_synthetic_pipeline():
    print("==================================================")
    print("SYNTHETIC E2E PIPELINE: Retrieval -> Verification -> Recommendation -> Eval")
    print("==================================================")
    
    # 1. Synthetic end-to-end corpus / requirements
    synthetic_query = "We need an electric motor for 230V indoor application with at least 5 HP."
    print(f"\n[1] Synthetic Query: {synthetic_query}")
    
    # 2. Retrieval & Verification (via engine)
    print("\n[2] Executing Retrieval & Verification Kernel...")
    req = StandardRecommendationRequest(
        query=synthetic_query,
        context={"project_type": "procurement"},
        limit=5,
        filters={}
    )
    
    # Engine processes through compilation -> hybrid search -> RRF -> constraints -> Verification
    response = engine.recommend(req)
    
    if response.recommended_standards:
        best = response.recommended_standards[0]
        print(f"Top Match: {best.standard_id} ({best.title})")
        print(f"Confidence: {best.confidence.confidence_level}")
        print(f"Verification: {best.verification_status}")
    else:
        print("No matches found in current local database.")
        
    # 3. Tender decomposition & Applicability
    print("\n[3] Executing Tender Analysis & Applicability...")
    tender_response = tender_service.analyze_text(synthetic_query)
    app_service = ApplicabilityService()
    
    for clause in tender_response.clauses:
        print(f"Clause extracted: {clause.text}")
        if clause.requirement:
            print(f" -> Requirement: {clause.requirement} = {clause.value} {clause.unit}")
    
    # 4. Specification Building
    print("\n[4] Executing Grounded Specification Builder...")
    from schemas.domain import Requirement, RequirementCategory
    reqs = [Requirement(category=RequirementCategory.ELECTRICAL, name="voltage", source_text="230V", normalized_value=230.0, unit="V")]
    stds = [{"family_id": "IS:12615"}]
    ev = [{"evidence_type": "CERTIFICATION", "source": "QCO Order"}]
    
    spec = specification_service.generate_specification(reqs, stds, ev)
    print(spec.specification_clause)
    
    # 5. Evaluation
    print("\n[5] Executing Evaluation...")
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from runner import run_evaluation
    run_evaluation()

if __name__ == "__main__":
    run_synthetic_pipeline()
