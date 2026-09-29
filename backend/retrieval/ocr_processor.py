"""
PaddleOCR Document & Image Ingestion Engine.
High-precision text and layout extraction for scanned government tenders,
bilingual gazettes (English + Hindi), BoQ tables, and image files.
"""

import sys
import os
import io
import re
import numpy as np
from typing import Dict, Any, List, Union, Optional
from loguru import logger
import fitz  # PyMuPDF
from PIL import Image

# 1. Prevent PyTorch DLL conflict on Windows Python 3.13 when imported via modelscope
if "torch" not in sys.modules:
    sys.modules["torch"] = None

# 2. Disable model source checks for zero network latency on cached weights
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["FLAGS_use_mkldnn"] = "0"

# 3. Patch paddlex static runner default run_mode to 'paddle' to avoid PIR oneDNN runtime issues
try:
    import paddlex.inference.models.runners.paddle_static.config.pp_option as pp_option
    pp_option.get_default_run_mode = lambda model_name, device_type: "paddle"
except Exception:
    pass


class PaddleOCRProcessor:
    """
    Sovereign OCR Engine using PaddleOCR for optical extraction from:
    - Scanned / Digital Tender PDFs (Every page rendering)
    - Raw image files (.png, .jpg, .jpeg, .tiff, .bmp, .webp)
    - Coordinate-based reading order and line reconstruction
    """

    _instance = None
    _ocr_en = None
    _ocr_hi = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(PaddleOCRProcessor, cls).__new__(cls)
        return cls._instance

    def __init__(self, default_lang: str = "en"):
        self.default_lang = default_lang

    def _get_ocr_engine(self, lang: str = "en"):
        """Lazy-initializes PaddleOCR instances to ensure zero startup latency."""
        try:
            from paddleocr import PaddleOCR
        except ImportError:
            logger.warning("[PaddleOCR] paddleocr is not installed.")
            return None

        if lang in ["hi", "devanagari"]:
            if self.__class__._ocr_hi is None:
                try:
                    logger.info("[PaddleOCR] Initializing Hindi/Devanagari OCR engine...")
                    self.__class__._ocr_hi = PaddleOCR(
                        lang="devanagari",
                        use_doc_orientation_classify=False,
                        use_doc_unwarping=False,
                        use_textline_orientation=True
                    )
                except Exception as e:
                    logger.warning(f"[PaddleOCR] Could not load devanagari model, falling back to 'en': {e}")
                    return self._get_ocr_engine("en")
            return self.__class__._ocr_hi
        else:
            if self.__class__._ocr_en is None:
                try:
                    logger.info("[PaddleOCR] Initializing English OCR engine...")
                    self.__class__._ocr_en = PaddleOCR(
                        lang="en",
                        use_doc_orientation_classify=False,
                        use_doc_unwarping=False,
                        use_textline_orientation=True
                    )
                except Exception as e:
                    logger.error(f"[PaddleOCR] Failed to initialize English PaddleOCR: {e}")
                    return None
            return self.__class__._ocr_en

    def _cluster_detections_into_lines(self, detections: List[Dict[str, Any]], y_tolerance: float = 12.0) -> List[str]:
        """
        Orders bounding-box detections into human-readable lines using vertical coordinate clustering.
        Detections whose vertical centers fall within y_tolerance are sorted left-to-right on the same line.
        """
        if not detections:
            return []

        augmented = []
        for d in detections:
            box = d["box"]
            xs = [pt[0] for pt in box]
            ys = [pt[1] for pt in box]
            min_x = min(xs)
            cy = sum(ys) / len(ys)
            height = max(ys) - min(ys)
            augmented.append({
                "text": d["text"],
                "confidence": d["confidence"],
                "box": box,
                "min_x": min_x,
                "cy": cy,
                "height": height
            })

        # Sort all boxes primarily by vertical position
        augmented.sort(key=lambda item: item["cy"])

        # Cluster boxes into lines
        lines_clusters = []
        current_cluster = []
        current_cluster_y = None

        for item in augmented:
            if current_cluster_y is None:
                current_cluster = [item]
                current_cluster_y = item["cy"]
            else:
                tol = max(y_tolerance, item["height"] * 0.45)
                if abs(item["cy"] - current_cluster_y) <= tol:
                    current_cluster.append(item)
                    current_cluster_y = sum(x["cy"] for x in current_cluster) / len(current_cluster)
                else:
                    lines_clusters.append(current_cluster)
                    current_cluster = [item]
                    current_cluster_y = item["cy"]

        if current_cluster:
            lines_clusters.append(current_cluster)

        # Sort each line left-to-right and join texts
        formatted_lines = []
        for cluster in lines_clusters:
            cluster.sort(key=lambda item: item["min_x"])
            line_str = " ".join(item["text"] for item in cluster).strip()
            if line_str:
                formatted_lines.append(line_str)

        return formatted_lines

    def ocr_image(self, image_input: Union[str, bytes, np.ndarray, Image.Image], lang: str = "en") -> Dict[str, Any]:
        """
        Runs OCR on a single image (file path, raw bytes, numpy array, or PIL Image).
        Returns structured text, lines, bounding boxes, and confidence score.
        """
        img_np = None

        if isinstance(image_input, str):
            if os.path.exists(image_input):
                img_pil = Image.open(image_input)
                img_np = np.array(img_pil.convert("RGB"))
            else:
                raise FileNotFoundError(f"Image file not found: {image_input}")
        elif isinstance(image_input, bytes):
            img_pil = Image.open(io.BytesIO(image_input))
            img_np = np.array(img_pil.convert("RGB"))
        elif isinstance(image_input, Image.Image):
            img_np = np.array(image_input.convert("RGB"))
        elif isinstance(image_input, np.ndarray):
            img_np = image_input
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        engine = self._get_ocr_engine(lang)
        if engine is None:
            return {
                "status": "ENGINE_UNAVAILABLE",
                "full_text": "",
                "lines": [],
                "detections": [],
                "avg_confidence": 0.0
            }

        try:
            results = engine.predict(img_np)
        except Exception as e:
            logger.error(f"[PaddleOCR] Inference error on image: {e}")
            return {
                "status": "ERROR",
                "error": str(e),
                "full_text": "",
                "lines": [],
                "detections": [],
                "avg_confidence": 0.0
            }

        detections = []
        confs = []

        for r in (results or []):
            rec_texts = []
            rec_scores = []
            rec_polys = []

            if isinstance(r, dict):
                rec_texts = r.get("rec_texts", [])
                rec_scores = r.get("rec_scores", [])
                rec_polys = r.get("rec_polys", r.get("dt_polys", []))
            elif hasattr(r, "get"):
                rec_texts = r.get("rec_texts", [])
                rec_scores = r.get("rec_scores", [])
                rec_polys = r.get("rec_polys", r.get("dt_polys", []))

            for idx, text in enumerate(rec_texts):
                t_clean = str(text).strip()
                if not t_clean:
                    continue
                score = float(rec_scores[idx]) if idx < len(rec_scores) else 0.90
                poly = rec_polys[idx].tolist() if idx < len(rec_polys) and hasattr(rec_polys[idx], "tolist") else [[0, 0], [100, 0], [100, 20], [0, 20]]
                detections.append({
                    "box": poly,
                    "text": t_clean,
                    "confidence": round(score, 4)
                })
                confs.append(score)

        lines = self._cluster_detections_into_lines(detections)
        full_text = "\n".join(lines)
        avg_conf = round(sum(confs) / len(confs), 4) if confs else 0.0

        return {
            "status": "SUCCESS",
            "full_text": full_text,
            "lines": lines,
            "detections": detections,
            "total_detections": len(detections),
            "avg_confidence": avg_conf
        }

    def ocr_pdf_document(self, pdf_input: Union[str, bytes], dpi: int = 150, lang: str = "en") -> Dict[str, Any]:
        """
        Renders every page of a PDF into high-res images and executes PaddleOCR on each page.
        """
        if isinstance(pdf_input, bytes):
            doc = fitz.open(stream=pdf_input, filetype="pdf")
        else:
            doc = fitz.open(pdf_input)

        pages_data = []
        all_lines = []
        page_texts = []
        total_detections = 0
        all_confs = []

        for pno in range(len(doc)):
            page = doc[pno]
            pix = page.get_pixmap(dpi=dpi)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            img_np = np.array(img)

            ocr_res = self.ocr_image(img_np, lang=lang)

            p_text = ocr_res.get("full_text", "")
            page_texts.append(p_text)
            all_lines.extend(ocr_res.get("lines", []))
            total_detections += ocr_res.get("total_detections", 0)

            for d in ocr_res.get("detections", []):
                all_confs.append(d["confidence"])

            pages_data.append({
                "page_number": pno + 1,
                "text": p_text,
                "lines": ocr_res.get("lines", []),
                "detection_count": ocr_res.get("total_detections", 0),
                "confidence": ocr_res.get("avg_confidence", 0.0)
            })

        doc.close()

        full_doc_text = "\n\n".join(page_texts)
        overall_conf = round(sum(all_confs) / len(all_confs), 4) if all_confs else 0.0

        return {
            "status": "SUCCESS",
            "total_pages": len(pages_data),
            "full_text": full_doc_text,
            "all_lines": all_lines,
            "pages": pages_data,
            "total_detections": total_detections,
            "avg_confidence": overall_conf
        }

# Global singleton
ocr_processor = PaddleOCRProcessor()
