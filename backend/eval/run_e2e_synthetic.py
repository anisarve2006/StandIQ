"""
[DEPRECATED / ARCHIVED TEST SUITE]
Early synthetic E2E pipeline test.
Unwanted test cases commented out in favor of the production-grade:
1. backend/eval/benchmark.py (75-item multilingual & multi-domain gold dataset)
2. backend/eval/test_dda_tender.py (Authentic 165-page DDA Tender BoQ audit)
3. backend/eval/test_paddle_ocr.py (PaddleOCR v2.9+ extraction accuracy)
"""

# import os
# import json
# from schemas.api import StandardRecommendationRequest
# from api_service import engine, tender_service, specification_service
# from services.applicability_service import ApplicabilityService
# from retrieval.compiler import extract_units_and_numbers

# def run_synthetic_pipeline():
#     # Deprecated: Use backend/eval/benchmark.py instead
#     pass

# if __name__ == "__main__":
#     print("Notice: run_e2e_synthetic is deprecated. Please run backend/eval/benchmark.py or backend/eval/test_dda_tender.py")

