"""
Layout-Aware PDF Ingestion & Tender Specification Extractor.
Uses PyMuPDF (fitz) with native table detection, section hierarchy parsing,
and multi-item Bill of Quantities (BoQ) extraction for government tenders.
"""

import io
import re
from typing import Dict, Any, List, Union, Optional
import fitz  # PyMuPDF

class TenderPDFProcessor:
    def __init__(self):
        # Common Tender Document Section Headers
        self.section_keywords = [
            "technical specification",
            "schedule of requirements",
            "bill of quantities",
            "boq",
            "scope of work",
            "particular specifications",
            "material specifications",
            "eligible makes and standards"
        ]

    def extract_document(self, pdf_input: Union[str, bytes]) -> Dict[str, Any]:
        """
        Parses PDF file path or raw bytes into:
        - metadata: page count, title, author
        - pages: page number, text, detected tables
        - tender_items: discrete line items or specification chunks for standards matching
        """
        if isinstance(pdf_input, bytes):
            doc = fitz.open(stream=pdf_input, filetype="pdf")
        else:
            doc = fitz.open(pdf_input)

        pages_data = []
        raw_full_text = []
        all_tables = []
        extracted_items = []

        for pno in range(len(doc)):
            page = doc[pno]
            page_text = page.get_text("text").strip()
            raw_full_text.append(page_text)

            # 1. Extract tabular data (BoQ line items)
            page_tables = []
            try:
                tabs = page.find_tables()
                for t in tabs:
                    tab_df = t.extract()
                    if tab_df and len(tab_df) > 1:
                        page_tables.append({
                            "page": pno + 1,
                            "headers": tab_df[0],
                            "rows": tab_df[1:]
                        })
                        all_tables.append(tab_df)
                        # Extract items from tabular rows
                        for row in tab_df[1:]:
                            row_text = " ".join([str(c) for c in row if c and str(c).strip()])
                            if len(row_text) > 15:
                                extracted_items.append({
                                    "source": f"Table (Page {pno + 1})",
                                    "raw_text": row_text,
                                    "page": pno + 1
                                })
            except Exception:
                pass

            pages_data.append({
                "page_number": pno + 1,
                "text_length": len(page_text),
                "has_tables": len(page_tables) > 0,
                "table_count": len(page_tables)
            })

        full_text = "\n\n".join(raw_full_text)

        # 2. Extract itemized paragraphs/clauses from text if tables did not yield items
        if not extracted_items:
            # Look for numbered lines: e.g. "1. Supply of...", "Item No 2: ...", "Clause 4.1 ..."
            item_regex = r'(?:(?:Item|Sl\.?\s*No\.?|Clause)\s*\d+[:\.\)]|\b\d+[\.\)]\s+)([A-Z][^\n]+(?:\n(?!\d+[\.\)])[^\n]+){1,4})'
            matches = re.finditer(item_regex, full_text, re.MULTILINE)
            for m in matches:
                item_str = m.group(0).strip()
                # Filter out short metadata noise
                if len(item_str.split()) >= 4 and not item_str.lower().startswith("page"):
                    extracted_items.append({
                        "source": "Specification Paragraph",
                        "raw_text": item_str,
                        "page": 1
                    })

        # 3. Fallback: If no structured items detected, partition text into meaningful thematic sections
        if not extracted_items:
            # Split into chunks of ~3-5 sentences
            paras = [p.strip() for p in full_text.split("\n\n") if len(p.strip().split()) >= 6]
            for idx, p in enumerate(paras[:10], start=1):
                extracted_items.append({
                    "source": f"Document Section {idx}",
                    "raw_text": p,
                    "page": 1
                })

        doc_meta = {
            "total_pages": len(doc),
            "table_count": len(all_tables),
            "extracted_items_count": len(extracted_items),
            "is_scanned": all(p["text_length"] < 20 for p in pages_data)
        }

        doc.close()

        return {
            "metadata": doc_meta,
            "full_text": full_text[:50000],  # safety cap
            "pages": pages_data,
            "extracted_items": extracted_items
        }
