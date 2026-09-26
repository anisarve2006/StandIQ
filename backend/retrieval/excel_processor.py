"""
Layout-Aware Government BoQ Excel Ingestion Engine (CPPP / GeM / State PWD).
Architecture Layer: Structured Tabular Ingestion with Ghost-Column Immunity.

Solves the common government portal artifact where old template text
(e.g., water pipes, sluice valves) remains hidden in columns 200+ of the spreadsheet.
Restricts table ingestion strictly to the verified active procurement table boundary.
"""

import os
import re
from typing import Dict, Any, List, Union, Optional
import xlrd
try:
    from retrieval.archetype_classifier import archetype_classifier
except ImportError:
    try:
        from backend.retrieval.archetype_classifier import archetype_classifier
    except ImportError:
        from .archetype_classifier import archetype_classifier

class TenderExcelProcessor:
    def __init__(self):
        self.max_contiguous_cols = 15

    def extract_document(self, file_path_or_bytes: Union[str, bytes], filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses CPPP / GeM BoQ spreadsheets (.xlsx / .xls / .csv) into structured procurement items.
        Features Ghost-Column Immunity: discards columns beyond active table boundary.
        """
        rows: List[List[str]] = []
        sheet_name = "BoQ"

        is_xlsx = False
        is_xls = False

        if filename:
            fn_lower = filename.lower()
            if fn_lower.endswith('.xlsx'):
                is_xlsx = True
            elif fn_lower.endswith('.xls'):
                is_xls = True

        if isinstance(file_path_or_bytes, bytes):
            if file_path_or_bytes.startswith(b'PK\x03\x04'):
                is_xlsx = True
            elif file_path_or_bytes.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'):
                is_xls = True
        elif isinstance(file_path_or_bytes, str):
            fn_lower = file_path_or_bytes.lower()
            if fn_lower.endswith('.xlsx'):
                is_xlsx = True
            elif fn_lower.endswith('.xls'):
                is_xls = True

        if is_xlsx:
            import io
            import openpyxl
            source = io.BytesIO(file_path_or_bytes) if isinstance(file_path_or_bytes, bytes) else file_path_or_bytes
            wb = openpyxl.load_workbook(source, data_only=True)
            sheet = None
            for sname in wb.sheetnames:
                if any(k in sname.lower() for k in ['boq', 'schedule', 'price']):
                    sheet = wb[sname]
                    break
            if sheet is None:
                sheet = wb.active
            sheet_name = getattr(sheet, 'title', 'BoQ')
            for r in sheet.iter_rows(values_only=True):
                rows.append([str(c).strip() if c is not None else "" for c in r])
        elif is_xls:
            if isinstance(file_path_or_bytes, bytes):
                book = xlrd.open_workbook(file_contents=file_path_or_bytes)
            else:
                book = xlrd.open_workbook(file_path_or_bytes)
            sheet = None
            for sname in book.sheet_names():
                if any(k in sname.lower() for k in ['boq', 'schedule', 'price']):
                    sheet = book.sheet_by_name(sname)
                    break
            if sheet is None:
                sheet = book.sheet_by_index(0)
            sheet_name = sheet.name
            for r in range(sheet.nrows):
                rows.append([str(sheet.cell_value(r, c)).strip() for c in range(sheet.ncols)])
        else:
            # Fallback CSV or tabular text
            import csv
            import io
            if isinstance(file_path_or_bytes, bytes):
                text_content = file_path_or_bytes.decode('utf-8', errors='ignore')
            else:
                with open(file_path_or_bytes, 'r', encoding='utf-8', errors='ignore') as f:
                    text_content = f.read()
            reader = csv.reader(io.StringIO(text_content))
            for r in reader:
                rows.append([str(c).strip() for c in r])

        # 1. Identify Header Row (Sl. No., Item Description, Quantity, Units, Rate)
        header_row_idx = None
        desc_col_idx = None
        sl_col_idx = None
        qty_col_idx = None
        unit_col_idx = None

        total_rows = len(rows)
        for r in range(min(25, total_rows)):
            row_raw = [rows[r][c].strip() for c in range(min(len(rows[r]), self.max_contiguous_cols))]
            row_normalized = [" ".join(val.split()).lower() for val in row_raw]
            
            # Check if this row is the primary column header row
            if any(any(h in val for h in ["item description", "description of item", "item particulars", "description"]) for val in row_normalized):
                header_row_idx = r
                for c, val in enumerate(row_normalized):
                    if any(h in val for h in ["item description", "description of item", "item particulars", "description"]):
                        desc_col_idx = c
                    elif any(h in val for h in ["sl. no.", "sl no", "item no", "sl.", "number #"]):
                        sl_col_idx = c
                    elif any(h in val for h in ["quantity", "tentative quantity", "qty"]):
                        qty_col_idx = c
                    elif any(h in val for h in ["units", "unit", "uom"]):
                        unit_col_idx = c
                break

        # Fallback default columns if specific headers not named standardly
        if desc_col_idx is None:
            desc_col_idx = 1
        if sl_col_idx is None:
            sl_col_idx = 0
        if header_row_idx is None:
            header_row_idx = 10

        extracted_items = []
        last_parent_desc = ""

        # 2. Extract Data Rows within the bounded active table columns
        for r in range(header_row_idx + 1, total_rows):
            # Enforce ghost column immunity: only inspect columns 0 to 12
            row_cells = [rows[r][c].strip() for c in range(min(len(rows[r]), self.max_contiguous_cols))]
            
            sl_val = row_cells[sl_col_idx] if sl_col_idx < len(row_cells) else ""
            desc_val = row_cells[desc_col_idx] if desc_col_idx < len(row_cells) else ""
            qty_val = row_cells[qty_col_idx] if qty_col_idx is not None and qty_col_idx < len(row_cells) else ""
            unit_val = row_cells[unit_col_idx] if unit_col_idx is not None and unit_col_idx < len(row_cells) else ""

            # Check if row is a CPPP column numbering guidance row (e.g. 1.0, 2.0, 3.0, 4.0 or (1), (2), (3))
            is_col_num_row = (
                len(row_cells) >= 3 and 
                (row_cells[0] in ["1.0", "(1)", "1"] and row_cells[1] in ["2.0", "(2)", "2"] and row_cells[2] in ["3.0", "(3)", "3"])
            )
            if is_col_num_row:
                continue

            # Check if row is a sub-header or empty
            desc_lower = desc_val.lower().strip()
            if not desc_val or desc_lower in [
                "total in figures", "quoted rate in figures", "quoted rate in words",
                "item description/ heading", "item description / heading", "item description/heading",
                "item description", "item particulars", "description of item"
            ]:
                continue
            if sl_val in ["0.0", "0"] and any(ph in desc_lower for ph in ["item description", "heading", "description of item"]):
                continue
            if len(desc_val) < 2:
                continue

            # Context inheritance for sub-breakdowns (e.g. Year1, Year 2, Phase 1)
            clean_desc = " ".join(desc_val.split())
            if re.match(r'^(?:year\s*\d+|phase\s*\d+)$', clean_desc, re.IGNORECASE) and last_parent_desc:
                effective_desc = f"{last_parent_desc} ({clean_desc})"
            else:
                effective_desc = clean_desc
                if len(clean_desc) > 15:
                    last_parent_desc = clean_desc

            # Classify archetype
            archetype_info = archetype_classifier.classify(effective_desc)

            source_lbl = f"BoQ Item {sl_val}" if sl_val else f"Row {r + 1}"

            extracted_items.append({
                "item_number": sl_val,
                "source": source_lbl,
                "raw_text": effective_desc,
                "quantity": qty_val,
                "unit": unit_val,
                "page": 1,
                "archetype": archetype_info["archetype"],
                "category": archetype_info["category"]
            })

        return {
            "metadata": {
                "file_type": "EXCEL_BOQ",
                "sheet_name": sheet_name,
                "total_rows": total_rows,
                "extracted_items_count": len(extracted_items)
            },
            "extracted_items": extracted_items
        }

# Global singleton
tender_excel_processor = TenderExcelProcessor()
