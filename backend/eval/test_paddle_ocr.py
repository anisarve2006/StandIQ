"""
Comprehensive Test Script for PaddleOCR Integration:
1. Tests PaddleOCR extraction from synthetic scanned tender image.
2. Tests PaddleOCR extraction from a multi-clause PDF tender document.
3. Tests end-to-end integration with StandardsRecommenderEngine.
"""

import sys
import os
import io
import time

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from retrieval.ocr_processor import ocr_processor
from retrieval.pdf_processor import TenderPDFProcessor
from retrieval.engine import StandardsRecommenderEngine

def create_sample_tender_image() -> Image.Image:
    """Generates a realistic scanned tender clause image."""
    img = Image.new('RGB', (1000, 300), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Simulate tender text
    draw.text((30, 30), "CENTRAL PUBLIC WORKS DEPARTMENT - TECHNICAL SPECIFICATION", fill=(0, 0, 0))
    draw.text((30, 70), "Item No 1: Supply and delivery of 150 mm nominal bore Mild Steel Tubes and tubulars,", fill=(20, 20, 20))
    draw.text((30, 105), "heavy grade, electrically resistance welded ERW, galvanized by hot-dip zinc coating,", fill=(20, 20, 20))
    draw.text((30, 140), "for conveying potable drinking water. Hydraulic test pressure 5 MPa.", fill=(20, 20, 20))
    draw.text((30, 180), "Regulatory Mandate: Goods must carry valid BIS ISI Certification Mark under relevant QCO.", fill=(10, 10, 10))
    draw.text((30, 220), "Bidders must submit valid CM/L license at the time of bid submission.", fill=(10, 10, 10))
    
    return img

def create_sample_tender_pdf(image: Image.Image) -> bytes:
    """Creates a PDF containing the scanned tender page."""
    import fitz
    doc = fitz.open()
    # Save PIL image to bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    # Create page with image
    page = doc.new_page(width=1000, height=350)
    page.insert_image(page.rect, stream=img_bytes)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def run_tests():
    print("=" * 80)
    print("TESTING PADDLE OCR INTEGRATION ACROSS IMAGES & TENDER DOCUMENTS")
    print("=" * 80)
    
    # 1. Test Direct Image OCR
    print("\n[Step 1] Generating and Testing Scanned Tender Image with PaddleOCR...")
    sample_img = create_sample_tender_image()
    
    t0 = time.time()
    ocr_res = ocr_processor.ocr_image(sample_img, lang="en")
    ocr_time = round((time.time() - t0) * 1000, 2)
    
    print(f"  OCR Status       : {ocr_res.get('status')} (Latency: {ocr_time}ms)")
    print(f"  Total Detections : {ocr_res.get('total_detections')}")
    print(f"  Avg Confidence   : {ocr_res.get('avg_confidence')}")
    print("  OCR Extracted Text Lines:")
    for line in ocr_res.get("lines", []):
        print(f"    | {line}")
        
    assert ocr_res.get("status") == "SUCCESS", f"OCR failed with status: {ocr_res.get('status')}"
    assert "1239" in ocr_res.get("full_text", "") or "Tubes" in ocr_res.get("full_text", "") or "Steel" in ocr_res.get("full_text", "")
    print("  -> Step 1 Passed!")
    
    # 2. Test PDF Document with PaddleOCR (Always OCR Every Page)
    print("\n[Step 2] Testing PDF Tender Extraction via PaddleOCR...")
    pdf_bytes = create_sample_tender_pdf(sample_img)
    pdf_proc = TenderPDFProcessor()
    
    t1 = time.time()
    pdf_res = pdf_proc.extract_document(pdf_bytes)
    pdf_time = round((time.time() - t1) * 1000, 2)
    
    print(f"  PDF Pages        : {pdf_res['metadata']['total_pages']}")
    print(f"  Extracted Items  : {len(pdf_res['extracted_items'])} (Latency: {pdf_time}ms)")
    for it in pdf_res['extracted_items']:
        print(f"    - [{it.get('source')}]: {it.get('raw_text')}")
        
    assert len(pdf_res['extracted_items']) > 0, "No items extracted from PDF via OCR"
    print("  -> Step 2 Passed!")
    
    # 3. Test End-to-End Engine Recommendation from Document
    print("\n[Step 3] Testing End-to-End Standards Recommendation via Engine...")
    engine = StandardsRecommenderEngine()
    
    matrix = engine.recommend_pdf(pdf_bytes, filename="scanned_cpwd_tender.pdf")
    print(f"  Total Items Audited : {matrix['total_items_analyzed']}")
    print(f"  Mandatory QCO Items : {matrix['compliance_summary']['mandatory_qco_items']}")
    
    if matrix['item_recommendations']:
        item0 = matrix['item_recommendations'][0]
        primary_std = item0['primary_standard']
        print(f"  Item 1 Standard     : {primary_std.get('raw_id')} - {primary_std.get('title_en')}")
        print(f"  Item 1 QCO          : {item0['certification'].get('applicable_qco')}")
    
    print("\n" + "=" * 80)
    print("ALL PADDLE OCR INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_tests()
