"""
Unit and Integration Tests for Hybrid Digital / OCR Document Ingestion.
Tests:
1. Pure Digital PDF (extracts digitally, skips OCR, fast).
2. Pure Scanned PDF (detects scanned raster page, executes ONNX RapidOCR).
3. Direct Image file upload (PNG/JPG with specification text).
"""

import io
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import fitz
from PIL import Image, ImageDraw
from retrieval.pdf_processor import TenderPDFProcessor
from retrieval.engine import StandardsRecommenderEngine

def test_ocr_and_digital_pipeline():
    processor = TenderPDFProcessor()
    engine = StandardsRecommenderEngine()

    print("==================================================")
    print("TEST 1: Pure Digital PDF Extraction")
    print("==================================================")
    doc_digital = fitz.open()
    page1 = doc_digital.new_page()
    page1.insert_text(
        (50, 50),
        "Item 1: Centrifugal Water Pump 50 LPS conforming to IS 1520\n"
        "Item 2: Fe 500D TMT Rebars 16mm IS 1786"
    )
    pdf_digital_bytes = doc_digital.write()
    doc_digital.close()

    res_digital = processor.extract_document(pdf_digital_bytes)
    print("Extraction mode:", res_digital["metadata"]["extraction_mode"])
    print("Is scanned:", res_digital["metadata"]["is_scanned"])
    print("Items count:", len(res_digital["extracted_items"]))
    for it in res_digital["extracted_items"]:
        print("  -", it["raw_text"])
    assert res_digital["metadata"]["extraction_mode"] == "DIGITAL", "Should be DIGITAL"
    assert not res_digital["metadata"]["is_scanned"], "Should not be marked scanned"
    assert len(res_digital["extracted_items"]) >= 1

    print("\n==================================================")
    print("TEST 2: Scanned PDF (Raster Image Page, No Text Layer)")
    print("==================================================")
    img = Image.new("RGB", (800, 300), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((30, 40), "Item 1: Three Phase Induction Motor 15kW IE3 IS 12615", fill=(0, 0, 0))
    d.text((30, 90), "Item 2: Fe 500D TMT Rebar nominal size 16mm IS 1786", fill=(0, 0, 0))
    
    img_buf = io.BytesIO()
    img.save(img_buf, format="PNG")
    img_bytes = img_buf.getvalue()

    doc_scanned = fitz.open()
    page_scanned = doc_scanned.new_page(width=800, height=300)
    page_scanned.insert_image(page_scanned.rect, stream=img_bytes)
    pdf_scanned_bytes = doc_scanned.write()
    doc_scanned.close()

    res_scanned = processor.extract_document(pdf_scanned_bytes)
    print("Extraction mode:", res_scanned["metadata"]["extraction_mode"])
    print("Is scanned:", res_scanned["metadata"]["is_scanned"])
    print("Items count:", len(res_scanned["extracted_items"]))
    for it in res_scanned["extracted_items"]:
        print("  -", it["raw_text"])
    assert res_scanned["metadata"]["extraction_mode"] == "OCR", "Should be OCR"
    assert res_scanned["metadata"]["is_scanned"] is True, "Should be marked scanned"
    assert len(res_scanned["extracted_items"]) >= 1

    print("\n==================================================")
    print("TEST 3: Direct Image File Upload (.png) Recommendation")
    print("==================================================")
    rec_img = engine.recommend_pdf(img_bytes, filename="tender_scan_page1.png")
    print("Status:", rec_img["status"])
    print("Extraction mode:", rec_img["document_metadata"].get("extraction_mode"))
    print("Total items analyzed:", rec_img["total_items_analyzed"])
    for it in rec_img["item_recommendations"]:
        title_safe = it['primary_standard']['title_en'].encode('ascii', 'ignore').decode()
        print(f"  Item {it['item_index']} [{it['primary_standard']['family_id']}]: {title_safe}")
    
    assert rec_img["status"] == "SUCCESS"
    assert rec_img["document_metadata"]["extraction_mode"] == "OCR"
    assert rec_img["total_items_analyzed"] >= 1

    print("\n==================================================")
    print("SUCCESS: ALL HYBRID DIGITAL & OCR TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_ocr_and_digital_pipeline()
