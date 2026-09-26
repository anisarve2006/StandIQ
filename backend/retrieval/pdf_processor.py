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

    def extract_document(self, pdf_input: Union[str, bytes]) -> Dict[str, Any]:
        """
        Parses PDF file path or raw bytes into:
        - metadata: page count, title, author
        - pages: page number, text, detected tables
        - extracted_items: discrete line items or specification chunks for standards matching
        """
        if isinstance(pdf_input, bytes):
            doc = fitz.open(stream=pdf_input, filetype="pdf")
        else:
            doc = fitz.open(pdf_input)

        pages_data = []
        raw_full_text = []
        all_tables = []
        extracted_items = []

        total_pages = len(doc)

        # 1. Scan for dedicated BoQ / Schedule of Quantities pages
        boq_page_indices = []
        for pno in range(total_pages):
            page_text = doc[pno].get_text("text").strip()
            raw_full_text.append(page_text)
            if any(k in page_text.upper() for k in ["SCHEDULE OF QUANTIT", "BILL OF QUANTIT", "SCHEDULE 'A'", "SCHEDULE \x27A\x27"]):
                tabs = doc[pno].find_tables()
                if tabs.tables:
                    boq_page_indices.append(pno)

        # If a dedicated BoQ start was found (e.g. Schedule A in CPWD/DDA at page 160),
        # track consecutive continuation pages that have matching table blocks
        if boq_page_indices and total_pages > 10:
            start_pno = boq_page_indices[-1]  # The actual schedule is typically at the end
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

        # 2. Extract structured line items
        for pno in range(total_pages):
            page = doc[pno]
            page_text = raw_full_text[pno] if pno < len(raw_full_text) else page.get_text("text").strip()
            
            # If dedicated BoQ block exists, prioritize those pages
            if boq_target_pages is not None and pno not in boq_target_pages:
                pages_data.append({
                    "page_number": pno + 1,
                    "text_length": len(page_text),
                    "has_tables": False,
                    "table_count": 0
                })
                continue

            page_tables = []
            try:
                tabs = page.find_tables()
                for t in tabs:
                    tab_df = t.extract()
                    if tab_df and len(tab_df) > 1:
                        # In large multi-page tenders without a dedicated BoQ block, only accept tables that have BoQ structure
                        if total_pages > 10 and boq_target_pages is None and not self._is_boq_table(tab_df[0]):
                            continue

                        page_tables.append({
                            "page": pno + 1,
                            "headers": tab_df[0],
                            "rows": tab_df[1:]
                        })
                        all_tables.append(tab_df)

                        # Extract items from tabular rows
                        for row in tab_df:
                            if not row:
                                continue
                            item_no = None
                            desc = None
                            
                            # Inspect cells to cleanly isolate item number & description
                            for cell in row:
                                if cell is None:
                                    continue
                                cs = str(cell).strip()
                                # Detect Item Number
                                if cs.isdigit() and int(cs) < 500 and item_no is None:
                                    item_no = cs
                                # Detect Description
                                elif len(cs) > 20 and not self._is_admin_boilerplate(cs) and desc is None:
                                    if not any(h in cs.lower() for h in ["description of item", "name of work", "sub head"]):
                                        desc = cs

                            # Special handling for Portal summaries (e.g. Work Description | Title)
                            if not desc and len(row) >= 2:
                                r_label = str(row[0]).strip().lower()
                                if any(lbl in r_label for lbl in ["title", "work description", "item description"]):
                                    val = str(row[1]).strip() if len(row) > 1 and row[1] else ""
                                    if len(val) > 15:
                                        desc = val

                            if desc:
                                clean_desc = " ".join(desc.split())
                                source_lbl = f"BoQ Item {item_no}" if item_no else f"Table (Page {pno + 1})"
                                extracted_items.append({
                                    "item_number": item_no,
                                    "source": source_lbl,
                                    "raw_text": clean_desc,
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

        # 3. Extract itemized paragraphs/clauses from text if tables did not yield items
        if not extracted_items:
            item_regex = r'(?:(?:Item|Sl\.?\s*No\.?|Clause)\s*\d+[:\.\)]|\b\d+[\.\)]\s+)([A-Z][^\n]+(?:\n(?!\d+[\.\)])[^\n]+){1,4})'
            matches = re.finditer(item_regex, full_text, re.MULTILINE)
            for m in matches:
                item_str = m.group(0).strip()
                if len(item_str.split()) >= 4 and not item_str.lower().startswith("page") and not self._is_admin_boilerplate(item_str):
                    extracted_items.append({
                        "item_number": None,
                        "source": "Specification Paragraph",
                        "raw_text": " ".join(item_str.split()),
                        "page": 1
                    })

        # 4. Fallback: If no structured items detected, partition text into meaningful thematic sections
        if not extracted_items:
            paras = [p.strip() for p in full_text.split("\n\n") if len(p.strip().split()) >= 6 and not self._is_admin_boilerplate(p)]
            for idx, p in enumerate(paras[:10], start=1):
                extracted_items.append({
                    "item_number": str(idx),
                    "source": f"Document Section {idx}",
                    "raw_text": " ".join(p.split()),
                    "page": 1
                })

        doc_meta = {
            "total_pages": total_pages,
            "table_count": len(all_tables),
            "extracted_items_count": len(extracted_items),
            "is_scanned": all(p["text_length"] < 20 for p in pages_data)
        }

        doc.close()

        return {
            "metadata": doc_meta,
            "full_text": full_text[:50000],
            "pages": pages_data,
            "extracted_items": extracted_items
        }
