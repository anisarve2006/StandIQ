"""
Layout-Aware PDF & Image Ingestion with Hybrid Digital / OCR Extractor.
Uses PyMuPDF (fitz) for high-speed digital text & vector table detection.
Seamlessly activates RapidOCR (ONNX Runtime) when scanned pages or images are detected.
"""

import io
import os
import re
import numpy as np
from typing import Dict, Any, List, Union, Optional
from loguru import logger
import fitz  # PyMuPDF
from retrieval.ocr_engine import OCREngine

class TenderPDFProcessor:
    def __init__(self):
        self.ocr_engine = OCREngine.get_instance()
        # Common Tender Document Section Headers
        self.section_keywords = [
            "technical specification",
            "schedule of requirements",
            "bill of quantities",
            "schedule of quantities",
            "schedule 'a'",
            "boq",
            "scope of work",
            "particular specifications",
            "material specifications",
            "eligible makes and standards"
        ]

    def _is_admin_boilerplate(self, text: str) -> bool:
        """Identifies portal or legal administrative noise that should not be treated as a procurement item."""
        t = text.lower().strip()
        if t in ["schedule of quantities", "bill of quantities", "schedule 'a'", "schedule a", "boq"]:
            return True

        # If text contains concrete technical/engineering keywords with sufficient substance, preserve it
        technical_keywords = [
            "supply", "delivery", "pipe", "tube", "steel", "cable", "conductor", "transformer", 
            "pump", "valve", "cement", "concrete", "grade", "diameter", "hydraulic", "pressure",
            "conveying", "specification", "is :", "is:", "is ", "isi mark", "qco", "cm/l"
        ]
        if any(tk in t for tk in technical_keywords) and len(t.split()) >= 6:
            return False

        noise_terms = [
            "tender fee", "earnest money", "emd amount", "emd fee", "bid submission",
            "bid opening", "critical dates", "mode of payment", "bankers cheque",
            "demand draft", "time allowed", "performance guarantee", "security deposit",
            "clauses of contract", "model rules", "labour regulation",
            "superintending engineer", "executive engineer", "arbitration",
            "notice inviting tender", "percentage rate tender", "general rules",
            "total (a)", "cost index", "gst correction", "total (b+c)",
            "tender inviting authority", "table of contents", "performa of schedule",
            "work /item(s)", "offline", "cover no", "instrument type",
            "tender reference number", "general technical evaluation", "multi currency",
            "clarification start", "pre bid meeting", "should allow nda", "document download",
            "document size", "published date", "organisation chain", "tender category",
            "cover details", "independent external monitor", "pre qualification details",
            "general conditions of contract", "special conditions of contract", "gcc clause", "scc clause",
            "qualifying requirements", "pre-qualification criteria", "payment terms", "defect liability",
            "governing laws", "effective date gcc", "amendments of, and supplements to",
            "rate contracts shall be awarded", "lowest received price", "price adjustment",
            "force majeure", "liquidated damages", "termination of contract", "schedule of price bid",
            "two-bid system", "selection process", "validity of offer", "important documents to be submitted",
            "sales tax clearance", "clearance certificate", "it clearance", "resolution of disputes",
            "jurisdiction all questions", "courts of delhi", "annexure - vi commercial bid", "annexure - ii",
            "annexure - iii", "annexure - iv", "annexure - v", "contact official", "email:", "company profile",
            "eligibility criteria", "terms and conditions of the tender", "technical bid (with one scanned",
            "dear sir,", "we undertake that we have never been black listed", "technical compliance statement",
            "opening of bid and evaluation", "name of company", "name of owner", "telephone and fax",
            "contact details of the person", "goods & service tax registration", "cumulative turn over",
            "address of offices", "year of commencement of business", "pan no.", "gst / taxes as required",
            "separate technical bids", "acquaintance with site", "completeness of job"
        ]
        return any(term in t for term in noise_terms)

    def _is_boq_table(self, headers: List[Any]) -> bool:
        """Determines if a table is a Bill of Quantities / Schedule of Quantities."""
        cells = [str(c).strip().lower() for c in headers if c and str(c).strip()]
        if not cells:
            return False
        # If any header cell is a massive text paragraph (> 80 chars), it is a narrative clause table, not BoQ
        if any(len(c) > 80 for c in cells):
            return False
        h_str = " ".join(cells)
        has_qty = any(re.search(rf'\b{q}\b', h_str) for q in ["qty", "quantity"])
        has_rate_or_amt = any(re.search(rf'\b{r}\b', h_str) for r in ["rate", "amount", "unit rate", "uom", "price", "unit cost"])
        has_desc = any(re.search(rf'\b{d}\b', h_str) for d in ["description", "particulars", "item", "item description"])
        has_page_col = ("page" in h_str or "page no" in h_str) and not has_rate_or_amt
        return ((has_qty and (has_desc or has_rate_or_amt)) or (has_rate_or_amt and has_desc)) and not has_page_col

    def extract_image_document(self, image_input: Union[str, bytes]) -> Dict[str, Any]:
        """
        Processes scanned or photograph tender images (PNG, JPG, TIFF, WEBP, etc.)
        using PaddleOCR and extracts itemized procurement specifications.
        """
        ocr_res = ocr_processor.ocr_image(image_input)
        full_text = ocr_res.get("full_text", "")
        lines = ocr_res.get("lines", [])

        extracted_items = []

        # 1. Check for itemized pattern in OCR lines
        for idx, line in enumerate(lines):
            line_str = line.strip()
            if self._is_admin_boilerplate(line_str):
                continue
            m = re.match(r'^(?:(?:Item|Sl\.?\s*No\.?|Clause)\s*(\d+)[:\.\)]|\b(\d+)[\.\)]\s+)(.*)', line_str, re.IGNORECASE)
            if m:
                num = m.group(1) or m.group(2)
                desc = m.group(3).strip()
                if len(desc.split()) >= 3:
                    extracted_items.append({
                        "item_number": num,
                        "source": f"Image Item {num}",
                        "raw_text": desc,
                        "page": 1
                    })

        # 2. If no numbered items detected, partition lines into substantive paragraphs
        if not extracted_items:
            paras = [p.strip() for p in full_text.split("\n") if len(p.strip().split()) >= 4 and not self._is_admin_boilerplate(p)]
            for idx, p in enumerate(paras[:15], start=1):
                extracted_items.append({
                    "item_number": str(idx),
                    "source": f"Image Section {idx}",
                    "raw_text": " ".join(p.split()),
                    "page": 1
                })

        doc_meta = {
            "total_pages": 1,
            "table_count": 0,
            "extracted_items_count": len(extracted_items),
            "is_scanned": True,
            "ocr_engine": "PaddleOCR",
            "ocr_confidence": ocr_res.get("avg_confidence", 0.0)
        }

        return {
            "metadata": doc_meta,
            "full_text": full_text[:50000],
            "pages": [{
                "page_number": 1,
                "text_length": len(full_text),
                "has_tables": False,
                "table_count": 0,
                "ocr_confidence": ocr_res.get("avg_confidence", 0.0)
            }],
            "extracted_items": extracted_items
        }

    def extract_document(self, pdf_input: Union[str, bytes], use_ocr: bool = True) -> Dict[str, Any]:
        """
        Parses PDF file path or raw bytes into:
        - metadata: page count, digital vs OCR breakdown, table count
        - pages: page number, text, detected tables, extraction mode (DIGITAL vs OCR)
        - extracted_items: discrete line items or specification chunks for standards matching
        
        Strategy:
        If page is digitally encoded -> extract text and tables digitally (fast & exact).
        If page is scanned -> render to image and perform ONNX RapidOCR.
        """
        if isinstance(pdf_input, bytes):
            doc = fitz.open(stream=pdf_input, filetype="pdf")
        else:
            doc = fitz.open(pdf_input)

        pages_data = []
        raw_full_text = []
        all_tables = []
        extracted_items = []
        ocr_confidences = []

        total_pages = len(doc)

        # 1. Pre-scan for text content & BoQ indices
        boq_page_indices = []
        page_scanned_flags = []

        for pno in range(total_pages):
            page = doc[pno]
            is_scanned = self.ocr_engine.is_page_scanned(page)
            page_scanned_flags.append(is_scanned)

            if not is_scanned:
                p_text = page.get_text("text").strip()
            else:
                p_text = ""  # Will be extracted via OCR in stage 2

            raw_full_text.append(p_text)

            if p_text and any(k in p_text.upper() for k in ["SCHEDULE OF QUANTIT", "BILL OF QUANTIT", "SCHEDULE 'A'", "SCHEDULE \x27A\x27"]):
                tabs = page.find_tables()
                if tabs.tables:
                    boq_page_indices.append(pno)

        # Track consecutive continuation pages if dedicated BoQ start was found
        if boq_page_indices and total_pages > 10:
            start_pno = boq_page_indices[-1]
            curr = start_pno
            boq_block = []
            while curr < total_pages:
                tabs = doc[curr].find_tables()
                if not tabs.tables:
                    break
                boq_block.append(curr)
                curr += 1
            boq_target_pages = set(boq_block)
        else:
            boq_target_pages = None

        # 2. Extract structured line items and text per page
        for pno in range(total_pages):
            page = doc[pno]
            is_scanned = page_scanned_flags[pno]
            page_mode = "OCR" if is_scanned else "DIGITAL"

            page_tables = []

            if not is_scanned:
                # Digital extraction
                page_text = raw_full_text[pno] if raw_full_text[pno] else page.get_text("text").strip()

                # If dedicated BoQ block exists, prioritize those pages
                if boq_target_pages is not None and pno not in boq_target_pages:
                    pages_data.append({
                        "page_number": pno + 1,
                        "text_length": len(page_text),
                        "has_tables": False,
                        "table_count": 0,
                        "extraction_mode": page_mode
                    })
                    continue

                try:
                    tabs = page.find_tables()
                    for t in tabs:
                        tab_df = t.extract()
                        if tab_df and len(tab_df) > 1:
                            if total_pages > 10 and boq_target_pages is None and not self._is_boq_table(tab_df[0]):
                                continue

                            page_tables.append({
                                "page": pno + 1,
                                "headers": tab_df[0],
                                "rows": tab_df[1:]
                            })
                            all_tables.append(tab_df)
                            self._extract_items_from_table(tab_df, pno + 1, extracted_items)
                except Exception:
                    pass

            else:
                # Scanned page -> Perform efficient OCR
                ocr_result = self.ocr_engine.extract_text_from_page(page, dpi=150)
                page_text = ocr_result.get("text", "").strip()
                raw_full_text[pno] = page_text

                # Check if OCR table rows were reconstructed
                table_rows = ocr_result.get("table_rows", [])
                if len(table_rows) > 1:
                    page_tables.append({
                        "page": pno + 1,
                        "headers": table_rows[0],
                        "rows": table_rows[1:]
                    })
                    all_tables.append(table_rows)
                    self._extract_items_from_table(table_rows, pno + 1, extracted_items)

            pages_data.append({
                "page_number": pno + 1,
                "text_length": len(page_text),
                "has_tables": len(page_tables) > 0,
                "table_count": len(page_tables),
                "extraction_mode": page_mode
            })

        full_text = "\n\n".join([t for t in raw_full_text if t.strip()])

        # 3. Extract itemized paragraphs/clauses from text if tables did not yield items
        if not extracted_items:
            all_text_lines = [l.strip() for l in full_text.split("\n") if l.strip()]
            current_item = None
            for line in all_text_lines:
                m = re.match(r'^(?:(?:Item|Sl\.?\s*No\.?|Clause)\s*(\d+)[:\.\)]|\b(\d+)[\.\)]\s+)(.*)', line, re.IGNORECASE)
                if m:
                    if current_item and len(current_item["raw_text"].split()) >= 3:
                        if not self._is_admin_boilerplate(current_item["raw_text"]):
                            extracted_items.append(current_item)
                    num = m.group(1) or m.group(2)
                    desc = m.group(3).strip()
                    current_item = {
                        "item_number": num,
                        "source": f"Clause {num}",
                        "raw_text": desc,
                        "page": 1
                    }
                elif current_item:
                    # Append continuation lines to current clause
                    if len(line.split()) > 0 and not any(line.upper().startswith(h) for h in ["SECTION", "PART", "CHAPTER", "ANNEX"]):
                        current_item["raw_text"] += " " + line

            if current_item and len(current_item["raw_text"].split()) >= 3:
                if not self._is_admin_boilerplate(current_item["raw_text"]):
                    extracted_items.append(current_item)

        # 4. Fallback: If no structured items detected, partition text into meaningful thematic sections
        if not extracted_items:
            paras = [p.strip() for p in full_text.split("\n\n") if len(p.strip().split()) >= 5 and not self._is_admin_boilerplate(p)]
            for idx, p in enumerate(paras[:15], start=1):
                extracted_items.append({
                    "item_number": str(idx),
                    "source": f"Document Section {idx}",
                    "raw_text": " ".join(p.split()),
                    "page": 1
                })

        ocr_count = sum(1 for p in pages_data if p["extraction_mode"] == "OCR")
        digital_count = sum(1 for p in pages_data if p["extraction_mode"] == "DIGITAL")

        doc_meta = {
            "total_pages": total_pages,
            "table_count": len(all_tables),
            "extracted_items_count": len(extracted_items),
            "is_scanned": ocr_count > 0,
            "extraction_mode": "DIGITAL" if ocr_count == 0 else ("OCR" if digital_count == 0 else "HYBRID"),
            "ocr_pages_count": ocr_count,
            "digital_pages_count": digital_count
        }

        doc.close()

        return {
            "metadata": doc_meta,
            "full_text": full_text[:50000],
            "pages": pages_data,
            "extracted_items": extracted_items
        }

    def extract_image(self, image_input: Union[str, bytes], filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses an uploaded image file (PNG, JPG, JPEG, WEBP, BMP, TIFF) using RapidOCR.
        Extracts structured text lines, table cells, and discrete technical specifications.
        """
        ocr_result = self.ocr_engine.extract_text_from_image(image_input)
        full_text = ocr_result.get("text", "").strip()
        table_rows = ocr_result.get("table_rows", [])
        lines = ocr_result.get("lines", [])

        extracted_items = []
        all_tables = []

        # 1. Check if structured table rows were reconstructed from OCR bounding boxes
        if len(table_rows) > 1:
            all_tables.append(table_rows)
            self._extract_items_from_table(table_rows, 1, extracted_items)

        # 2. Extract itemized paragraphs/clauses from text if tables did not yield items
        if not extracted_items and full_text:
            item_regex = r'(?:(?:Item|Sl\.?\s*No\.?|Clause)\s*\d+[:\.\)]|\b\d+[\.\)]\s+)([A-Z0-9][^\n]+(?:\n(?!\d+[\.\)])[^\n]+){1,3})'
            matches = re.finditer(item_regex, full_text, re.MULTILINE)
            for m in matches:
                item_str = m.group(0).strip()
                if len(item_str.split()) >= 3 and not self._is_admin_boilerplate(item_str):
                    extracted_items.append({
                        "item_number": None,
                        "source": "Image OCR Item",
                        "raw_text": " ".join(item_str.split()),
                        "page": 1
                    })

        # 3. Fallback: Parse distinct line groups or paragraphs from OCR output
        if not extracted_items and full_text:
            # Group lines or split by paragraphs
            paras = [p.strip() for p in full_text.split("\n\n") if len(p.strip().split()) >= 3 and not self._is_admin_boilerplate(p)]
            if not paras:
                paras = [l.strip() for l in full_text.splitlines() if len(l.strip().split()) >= 3 and not self._is_admin_boilerplate(l)]

            for idx, p in enumerate(paras[:15], start=1):
                extracted_items.append({
                    "item_number": str(idx),
                    "source": f"Image Clause {idx}",
                    "raw_text": " ".join(p.split()),
                    "page": 1
                })

        doc_meta = {
            "file_type": "IMAGE_DOCUMENT",
            "total_pages": 1,
            "table_count": len(all_tables),
            "extracted_items_count": len(extracted_items),
            "is_scanned": True,
            "extraction_mode": "OCR",
            "ocr_confidence": ocr_result.get("confidence", 0.0),
            "ocr_pages_count": 1,
            "digital_pages_count": 0
        }

        pages_data = [{
            "page_number": 1,
            "text_length": len(full_text),
            "has_tables": len(all_tables) > 0,
            "table_count": len(all_tables),
            "extraction_mode": "OCR"
        }]

        return {
            "metadata": doc_meta,
            "full_text": full_text[:50000],
            "pages": pages_data,
            "extracted_items": extracted_items
        }

    def _extract_items_from_table(self, tab_df: List[List[Any]], page_no: int, extracted_items: List[Dict[str, Any]]):
        """Extracts procurement specifications from tabular rows."""
        for row in tab_df:
            if not row:
                continue
            item_no = None
            desc = None

            for cell in row:
                if cell is None:
                    continue
                cs = str(cell).strip()
                if cs.isdigit() and int(cs) < 500 and item_no is None:
                    item_no = cs
                elif len(cs) > 15 and not self._is_admin_boilerplate(cs) and desc is None:
                    if not any(h in cs.lower() for h in ["description of item", "name of work", "sub head"]):
                        desc = cs

            if not desc and len(row) >= 2:
                r_label = str(row[0]).strip().lower()
                if any(lbl in r_label for lbl in ["title", "work description", "item description"]):
                    val = str(row[1]).strip() if len(row) > 1 and row[1] else ""
                    if len(val) > 12:
                        desc = val

            if desc:
                clean_desc = " ".join(desc.split())
                # Check if this row is a continuation of the previous item from a split table cell across pages
                if item_no is None and extracted_items:
                    last_item = extracted_items[-1]
                    if last_item.get("item_number") is not None and (
                        clean_desc[0].islower() or 
                        last_item["raw_text"].rstrip().endswith(("from", "conforming to", "with", "as per", ":", "IS :", "IS : 1", "derived from", ",", "and", "or")) or
                        any(clean_desc.startswith(pfx) for pfx in ["natural sources", "Ivory", "matching", "including", "over", "and", "jointing", "in skirting"])
                    ):
                        last_item["raw_text"] += " " + clean_desc
                        continue

                source_lbl = f"BoQ Item {item_no}" if item_no else f"BoQ Item (Page {page_no})"
                extracted_items.append({
                    "item_number": item_no,
                    "source": source_lbl,
                    "raw_text": clean_desc,
                    "page": page_no
                })
