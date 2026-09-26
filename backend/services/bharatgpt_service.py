"""
BharatGPT-3B Indic Local Sovereign LLM Service.
Runs 100% locally and air-gapped via GGUF format with CPU multi-threading.
Replaces external cloud APIs (Groq) for:
1. Indic-to-English Procurement Translation (Devanagari, Tamil, Telugu, etc.)
2. 5-Point GeM Tender Clause Specification Drafting

Built with automatic graceful fallback to deterministic neuro-symbolic trade
lexicons and templates if the model is busy, slow, or unavailable.
"""

import os
import re
import sys
import threading
from typing import Optional, Dict, Any, List
from loguru import logger

# Thread lock to guarantee thread-safe inference across concurrent FastAPI workers
_INFERENCE_LOCK = threading.Lock()

class BharatGPTService:
    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(BharatGPTService, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_path: Optional[str] = None):
        if self._initialized:
            return
        
        self.model_path = self._resolve_model_path(model_path)
        self.llm = None
        self._load_error = None
        self._init_model()
        BharatGPTService._initialized = True

    def _resolve_model_path(self, custom_path: Optional[str] = None) -> Optional[str]:
        target = custom_path or os.getenv("BHARATGPT_MODEL_PATH", "BharatGPT-3B-Indic.Q8_0.gguf")
        
        # Check direct path or current working directory
        if os.path.exists(target):
            return os.path.abspath(target)
        cwd_candidate = os.path.join(os.getcwd(), target)
        if os.path.exists(cwd_candidate):
            return os.path.abspath(cwd_candidate)
        
        # Check project root (parent of backend: SIH 26108)
        current_file = os.path.abspath(__file__)
        services_dir = os.path.dirname(current_file)
        backend_dir = os.path.dirname(services_dir)
        project_root = os.path.dirname(backend_dir)
        
        for base in [project_root, backend_dir, r"c:\Users\Pushkar Shelar\Desktop\SIH 26108"]:
            candidate = os.path.join(base, target)
            if os.path.exists(candidate):
                return os.path.abspath(candidate)
        
        return target

    def _init_model(self):
        """Loads BharatGPT-3B GGUF into RAM at startup."""
        if not self.model_path or not os.path.exists(self.model_path):
            self._load_error = f"GGUF model file not found at: {self.model_path}"
            logger.warning(f"[BharatGPT] {self._load_error}. Running in FALLBACK mode.")
            return

        try:
            from llama_cpp import Llama
            logger.info(f"[BharatGPT] Loading sovereign model into RAM from {self.model_path}...")
            # n_threads defaults to 4 or max available cores; n_ctx=2048 handles full clauses & specs
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=2048,
                n_threads=min(4, os.cpu_count() or 4),
                verbose=False
            )
            logger.info("[BharatGPT] Successfully loaded BharatGPT-3B-Indic into RAM (Air-Gapped Sovereign Mode ACTIVE)")
        except ImportError:
            self._load_error = "llama-cpp-python is not installed"
            logger.warning("[BharatGPT] llama-cpp-python is not installed. Running in FALLBACK mode.")
        except Exception as e:
            self._load_error = str(e)
            logger.error(f"[BharatGPT] Failed to load GGUF model: {e}. Running in FALLBACK mode.")

    def is_available(self) -> bool:
        return self.llm is not None

    def get_status(self) -> Dict[str, Any]:
        return {
            "available": self.is_available(),
            "model_path": self.model_path,
            "backend": "Local GGUF (CPU AVX2)" if self.is_available() else "UNAVAILABLE",
            "error": self._load_error
        }

    def translate_indic(self, masked_text: str, script_name: str = "devanagari") -> Optional[str]:
        """
        Translates Indic procurement text with Entity Guard placeholders preserved.
        Returns None on any failure to immediately trigger the deterministic trade lexicon.
        """
        if not self.is_available():
            return None

        prompt = (
            f"### Instruction:\n"
            f"Translate the following Indian procurement tender text into technical English.\n"
            f"STRICT RULES:\n"
            f"1. Keep all placeholder tokens like __TECH_PARAM_0__, __TECH_PARAM_1__ exactly as they are without modifying or dropping them.\n"
            f"2. Return ONLY the English translation without preamble, quotation marks, or explanations.\n\n"
            f"### Input ({script_name}):\n{masked_text}\n\n"
            f"### English Translation:\n"
        )

        try:
            with _INFERENCE_LOCK:
                response = self.llm(
                    prompt,
                    max_tokens=80,
                    stop=["###", "\n\n", "### Input"],
                    temperature=0.1
                )
                output = response["choices"][0]["text"].strip()
                # Clean up any residual markers
                output = re.sub(r'^(English Translation:|"|\')', '', output).strip()
                output = output.strip('"\'')
                if output and len(output) > 3:
                    return output
                return None
        except Exception as e:
            logger.warning(f"[BharatGPT] Translation failed ({e}), falling back to deterministic lexicon.")
            return None

    def draft_specification_clause(
        self,
        product_name: str,
        standard_id: str,
        standard_title: str,
        parameters: Optional[Dict[str, Any]] = None,
        certification_info: Optional[str] = None
    ) -> Optional[str]:
        """
        Drafts a formal 5-point GeM / CPPP procurement clause using BharatGPT-3B.
        Returns None on failure to immediately trigger the deterministic 5-point template.
        """
        if not self.is_available():
            return None

        param_str = ", ".join([f"{k}: {v}" for k, v in (parameters or {}).items()]) if parameters else "Standard commercial grades"
        cert_str = certification_info or "Standard quality compliance"

        prompt = (
            f"### Instruction:\n"
            f"Draft a formal, concise 5-point procurement specification clause for the Government e-Marketplace (GeM) conforming to the Bureau of Indian Standards (BIS).\n\n"
            f"### Product: {product_name}\n"
            f"### Indian Standard: {standard_id} ({standard_title})\n"
            f"### Technical Parameters: {param_str}\n"
            f"### Certification: {cert_str}\n\n"
            f"### 5-Point GeM Specification Clause:\n"
        )

        try:
            with _INFERENCE_LOCK:
                response = self.llm(
                    prompt,
                    max_tokens=220,
                    stop=["###", "\n\n\n"],
                    temperature=0.2
                )
                output = response["choices"][0]["text"].strip()
                if output and "1." in output:
                    return output
                return None
        except Exception as e:
            logger.warning(f"[BharatGPT] Clause drafting failed ({e}), falling back to deterministic template.")
            return None

# Global singleton instance loaded once at startup
bharatgpt_engine = BharatGPTService()
