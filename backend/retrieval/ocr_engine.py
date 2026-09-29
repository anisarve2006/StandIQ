"""
Efficient Hybrid OCR & Digital Document Engine for Indian Standards Recommender.
Provides layout-aware OCR using RapidOCR (ONNX Runtime) with graceful fallbacks
to PyMuPDF digital text extraction and pytesseract.
"""

import io
import os
import re
import logging
from typing import Dict, Any, List, Optional, Union, Tuple
from PIL import Image
import numpy as np

logger = logging.getLogger("OCREngine")

class OCREngine:
    """
    High-performance OCR Engine running on ONNX Runtime.
    Automatically distinguishes between digital documents (instant text extraction)
    and scanned/rasterized documents (ONNX-powered OCR).
    """

    _instance = None
    _rapid_ocr = None
    _init_attempted = False

    def __init__(self):
        self._ensure_ocr_initialized()

    @classmethod
    def get_instance(cls) -> "OCREngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _ensure_ocr_initialized(self):
        """Lazy loader for RapidOCR ONNX models to preserve sub-second startup time."""
        if self._init_attempted:
            return
        self._init_attempted = True
        try:
            from rapidocr_onnxruntime import RapidOCR
            # Initialize RapidOCR with default balanced models
            self._rapid_ocr = RapidOCR()
            logger.info("RapidOCR ONNX Runtime engine initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize RapidOCR: {e}. Checking pytesseract fallback.")
            self._rapid_ocr = None

    @property
    def is_ocr_available(self) -> bool:
        return self._rapid_ocr is not None

    def is_page_scanned(self, page, min_char_count: int = 35) -> bool:
        """
        Determines if a PyMuPDF page is digitally encoded or a raster scan.
        Returns False if digital text is rich and extractable.
        Returns True if the page has sparse or no text and relies on raster images.
        """
        try:
            # 1. Check direct digital text extraction
            text = page.get_text("text").strip()
            alnum_count = sum(1 for c in text if c.isalnum())
            
            # If text has sufficient alphanumeric characters, it is digital
            if alnum_count >= min_char_count:
                return False
            
            # 2. If text is sparse (< 35 alnum chars), check if page contains raster images
            images = page.get_images(full=True)
            if images:
                return True
            
            # 3. Check drawing paths or vector coverage
            drawings = page.get_drawings()
            if not drawings and alnum_count == 0:
                # Blank or image-only page
                return True

            return alnum_count < min_char_count
        except Exception:
            return False

    def extract_text_from_page(self, page, dpi: int = 150) -> Dict[str, Any]:
        """
        Renders a PyMuPDF page to an image pixmap and performs efficient OCR.
        DPI 150 provides the optimal balance between high OCR accuracy (>95%) and speed.
        """
        try:
            # Render pixmap from PyMuPDF
            pix = page.get_pixmap(dpi=dpi)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            return self.extract_text_from_image(img)
        except Exception as e:
            logger.error(f"Error during page OCR rendering: {e}")
            return {
                "text": "",
                "lines": [],
                "table_rows": [],
                "confidence": 0.0,
                "is_ocr": True,
                "error": str(e)
            }

    def extract_text_from_image(self, image_input: Union[str, bytes, Image.Image, np.ndarray]) -> Dict[str, Any]:
        """
        Performs OCR on an image file path, raw bytes, PIL Image, or numpy array.
        Returns structured lines, sorted reading order, table rows, and reconstructed text.
        """
        self._ensure_ocr_initialized()

        # Load image into PIL Image or numpy array
        try:
            if isinstance(image_input, bytes):
                img = Image.open(io.BytesIO(image_input)).convert("RGB")
                img_np = np.array(img)
            elif isinstance(image_input, str):
                img = Image.open(image_input).convert("RGB")
                img_np = np.array(img)
            elif isinstance(image_input, Image.Image):
                img = image_input.convert("RGB")
                img_np = np.array(img)
            elif isinstance(image_input, np.ndarray):
                img_np = image_input
            else:
                raise ValueError(f"Unsupported image input type: {type(image_input)}")
        except Exception as e:
            logger.error(f"Failed to load image for OCR: {e}")
            return {
                "text": "",
                "lines": [],
                "table_rows": [],
                "confidence": 0.0,
                "is_ocr": True,
                "error": f"Invalid image format: {e}"
            }

        # 1. Primary Engine: RapidOCR (ONNX)
        if self._rapid_ocr is not None:
            try:
                ocr_results, _ = self._rapid_ocr(img_np)
                if ocr_results:
                    return self._process_ocr_results(ocr_results)
            except Exception as e:
                logger.warning(f"RapidOCR execution failed: {e}. Falling back to pytesseract if present.")

        # 2. Secondary Fallback: pytesseract
        try:
            import pytesseract
            raw_text = pytesseract.image_to_string(img_np)
            lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
            return {
                "text": "\n".join(lines),
                "lines": [{"text": l, "confidence": 0.85, "box": []} for l in lines],
                "table_rows": [[l] for l in lines],
                "confidence": 0.85,
                "is_ocr": True
            }
        except Exception:
            pass

        return {
            "text": "",
            "lines": [],
            "table_rows": [],
            "confidence": 0.0,
            "is_ocr": True,
            "error": "OCR engine not available or no text detected."
        }

    def _process_ocr_results(self, ocr_results: List[Any]) -> Dict[str, Any]:
        """
        Post-processes raw OCR bounding boxes:
        - Orders boxes by top-to-bottom reading sequence.
        - Groups bounding boxes that share similar horizontal Y-bands to detect table rows.
        - Computes mean recognition confidence.
        """
        raw_items = []
        confidences = []

        for item in ocr_results:
            # item format: [box, text, score]
            # box format: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            if len(item) >= 3:
                box, text, score = item[0], str(item[1]).strip(), float(item[2])
                if not text:
                    continue
                # Calculate bounding box center and coordinates
                xs = [pt[0] for pt in box]
                ys = [pt[1] for pt in box]
                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)
                center_y = (min_y + max_y) / 2.0
                center_x = (min_x + max_x) / 2.0
                height = max_y - min_y

                raw_items.append({
                    "text": text,
                    "confidence": score,
                    "box": box,
                    "min_x": min_x,
                    "max_x": max_x,
                    "min_y": min_y,
                    "max_y": max_y,
                    "center_x": center_x,
                    "center_y": center_y,
                    "height": height
                })
                confidences.append(score)

        if not raw_items:
            return {
                "text": "",
                "lines": [],
                "table_rows": [],
                "confidence": 0.0,
                "is_ocr": True
            }

        # Average line height for dynamic row grouping
        avg_height = sum(item["height"] for item in raw_items) / len(raw_items)
        y_tolerance = max(8.0, avg_height * 0.6)

        # Sort all items primarily by Y-coordinate
        raw_items.sort(key=lambda item: item["center_y"])

        # Group items into horizontal bands (rows)
        rows: List[List[Dict[str, Any]]] = []
        for item in raw_items:
            placed = False
            for row in rows:
                row_y = sum(cell["center_y"] for cell in row) / len(row)
                if abs(item["center_y"] - row_y) <= y_tolerance:
                    row.append(item)
                    placed = True
                    break
            if not placed:
                rows.append([item])

        # Sort rows top-to-bottom, and within each row sort cells left-to-right
        rows.sort(key=lambda r: sum(cell["center_y"] for cell in r) / len(r))
        table_rows: List[List[str]] = []
        structured_lines: List[str] = []

        for row in rows:
            row.sort(key=lambda cell: cell["min_x"])
            row_texts = [cell["text"] for cell in row]
            table_rows.append(row_texts)
            structured_lines.append("   ".join(row_texts))

        full_text = "\n".join(structured_lines)
        avg_confidence = round(sum(confidences) / len(confidences), 3) if confidences else 0.0

        return {
            "text": full_text,
            "lines": raw_items,
            "table_rows": table_rows,
            "confidence": avg_confidence,
            "is_ocr": True
        }
