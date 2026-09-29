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

# Automatically load environment variables from root or backend .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    _curr_dir = os.path.dirname(os.path.abspath(__file__))
    _backend_env = os.path.join(os.path.dirname(_curr_dir), ".env")
    if os.path.exists(_backend_env):
        load_dotenv(_backend_env)
    _root_env = os.path.join(os.path.dirname(os.path.dirname(_curr_dir)), ".env")
    if os.path.exists(_root_env):
        load_dotenv(_root_env)
except Exception:
    pass

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
        """Loads BharatGPT-3B GGUF into RAM or configures Modal Serverless GPU endpoint."""
        if os.getenv("USE_BHARATGPT", "false").lower() == "false":
            self._load_error = "BharatGPT disabled: Deterministic Rule-Based Mode ACTIVE"
            logger.info("[BharatGPT] USE_BHARATGPT=false. Running in 100% deterministic rule-based mode.")
            return

        modal_url = os.getenv("BHARATGPT_MODAL_URL", "").strip().rstrip("/")
        if modal_url:
            self._modal_url = modal_url
            self._backend_type = "Modal Serverless GPU"
            logger.info(f"[BharatGPT] Configured for Modal Serverless GPU at {self._modal_url}")
            return

        self._modal_url = None
        if not self.model_path or not os.path.exists(self.model_path):
            self._load_error = f"GGUF model file not found at: {self.model_path}"
            logger.warning(f"[BharatGPT] {self._load_error}. Running in FALLBACK mode.")
            return

        try:
            from llama_cpp import Llama
            logger.info(f"[BharatGPT] Loading sovereign model into RAM from {self.model_path} (CPU AVX2)...")
            # n_threads defaults to 4 or max available cores; n_ctx=2048 handles full clauses & specs
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=2048,
                n_threads=min(4, os.cpu_count() or 4),
                verbose=False
            )
            self._backend_type = "Local GGUF (CPU AVX2)"
            logger.info("[BharatGPT] Successfully loaded BharatGPT-3B-Indic into RAM (Air-Gapped Sovereign Mode ACTIVE)")
        except ImportError:
            try:
                from transformers import AutoModelForCausalLM
                logger.info(f"[BharatGPT] Loading model via transformers from {self.model_path}...")
                dirname = os.path.dirname(self.model_path) or "."
                basename = os.path.basename(self.model_path)
                self.llm = AutoModelForCausalLM.from_pretrained(
                    dirname,
                    gguf_file=basename,
                    device_map="auto"
                )
                self._backend_type = "Local GGUF (Transformers)"
                logger.info("[BharatGPT] Successfully loaded BharatGPT-3B-Indic into RAM via Transformers")
            except Exception as te:
                self._load_error = f"Failed to load model: {te}"
                logger.warning(f"[BharatGPT] {self._load_error}. Running in FALLBACK mode.")
        except Exception as e:
            self._load_error = str(e)
            logger.error(f"[BharatGPT] Failed to load GGUF model: {e}. Running in FALLBACK mode.")

    def is_available(self) -> bool:
        if os.getenv("USE_BHARATGPT", "false").lower() == "false":
            return False
        if getattr(self, "_modal_url", None):
            return True
        return self.llm is not None

    def get_status(self) -> Dict[str, Any]:
        return {
            "available": self.is_available(),
            "model_path": self.model_path,
            "backend": getattr(self, "_backend_type", "Local GGUF (CPU AVX2)") if self.is_available() else "UNAVAILABLE",
            "modal_url": getattr(self, "_modal_url", None),
            "error": self._load_error
        }

    def generate(
        self,
        prompt: str,
        max_tokens: int = 256,
        temperature: float = 0.1,
        stop: Optional[List[str]] = None
    ) -> Optional[str]:
        """
        Open-ended text completion via BharatGPT (Modal Serverless or Local GGUF).
        """
        if not self.is_available():
            return None

        # 1. Remote Modal Serverless Execution
        if getattr(self, "_modal_url", None):
            try:
                import requests
                resp = requests.post(
                    f"{self._modal_url}/generate",
                    json={
                        "prompt": prompt,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        "stop": stop or ["###", "\n\n"]
                    },
                    timeout=60
                )
                if resp.status_code == 200:
                    text = resp.json().get("text", "").strip()
                    if text:
                        return text
            except Exception as me:
                logger.warning(f"[BharatGPT-Modal] Generation failed ({me})")
                return None
            return None

        # 2. Local In-Memory GGUF Execution
        if not self.llm:
            return None

        try:
            with _INFERENCE_LOCK:
                response = self.llm(
                    prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stop=stop or ["###", "\n\n"]
                )
                return response["choices"][0]["text"].strip()
        except Exception as e:
            logger.warning(f"[BharatGPT] Generation failed ({e})")
            return None

    def translate_indic(self, masked_text: str, script_name: str = "devanagari") -> Optional[str]:
        """
        Translates Indic procurement text with Entity Guard placeholders preserved.
        Returns None on any failure to immediately trigger the deterministic trade lexicon.
        """
        if not self.is_available():
            return None

        # 1. Remote Modal Serverless Execution
        if getattr(self, "_modal_url", None):
            try:
                import requests
                resp = requests.post(
                    f"{self._modal_url}/translate",
                    json={"masked_text": masked_text, "script_name": script_name},
                    timeout=45
                )
                if resp.status_code == 200:
                    text = resp.json().get("translated_text", "").strip()
                    if text and len(text) > 3:
                        return text
            except Exception as me:
                logger.warning(f"[BharatGPT-Modal] Translation failed ({me}), falling back to deterministic lexicon.")
                return None
            return None

        if not self.llm:
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

    def canonicalize_trade_entity(self, text: str) -> Optional[str]:
        """
        Translates arbitrary colloquial, regional, or complex trade specification text
        into canonical Bureau of Indian Standards product / material nomenclature.
        """
        if not self.is_available():
            return None

        # 1. Remote Modal Serverless Execution
        if getattr(self, "_modal_url", None):
            try:
                import requests
                resp = requests.post(
                    f"{self._modal_url}/canonicalize",
                    json={"text": text},
                    timeout=45
                )
                if resp.status_code == 200:
                    canonical = resp.json().get("canonical_title", "").strip()
                    if canonical and len(canonical) > 3:
                        return canonical
            except Exception as me:
                logger.warning(f"[BharatGPT-Modal] Canonicalization failed ({me})")
                return None
            return None

        if not self.llm:
            return None

        prompt = (
            "### Instruction:\n"
            "You are an expert Bureau of Indian Standards (BIS) and GeM engineering classifier.\n"
            "Given a trade specification or colloquial procurement term, output ONLY the formal canonical Indian Standard product or material title.\n"
            "Examples:\n"
            "Input: sariya Fe-500\nOutput: high strength deformed steel bars and wires for concrete reinforcement\n"
            "Input: ready mix concrete M-20\nOutput: ready-mixed concrete / plain and reinforced concrete\n"
            "Input: vitrified mirror glossy tiles\nOutput: pressed ceramic tiles for flooring\n"
            "Input: dry rubble stone soling\nOutput: natural building stones soling for building works\n"
            f"Input: {text}\n"
            "Output:"
        )

        try:
            with _INFERENCE_LOCK:
                response = self.llm(
                    prompt,
                    max_tokens=60,
                    stop=["\n", "###", "Input:"],
                    temperature=0.1
                )
                output = response["choices"][0]["text"].strip()
                output = re.sub(r'^(Output:|Canonical:|Title:|"|\')', '', output).strip()
                output = output.strip('"\'')
                if output and len(output) > 3:
                    return output
                return None
        except Exception as e:
            logger.warning(f"[BharatGPT] Canonicalization failed ({e})")
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

        # 1. Remote Modal Serverless Execution
        if getattr(self, "_modal_url", None):
            try:
                import requests
                resp = requests.post(
                    f"{self._modal_url}/draft_clause",
                    json={
                        "product_name": product_name,
                        "standard_id": standard_id,
                        "standard_title": standard_title,
                        "parameters": param_str,
                        "certification_info": cert_str
                    },
                    timeout=60
                )
                if resp.status_code == 200:
                    clause = resp.json().get("clause", "").strip()
                    if clause and len(clause) > 10:
                        return clause
            except Exception as me:
                logger.warning(f"[BharatGPT-Modal] Clause drafting failed ({me}), falling back to deterministic template.")
                return None
            return None

        if not self.llm:
            return None

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

    def arbitrate_candidates(
        self,
        tender_query: str,
        candidates: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Action 4: Ambiguity Judge & Tie-Breaker.
        When candidate #1 and candidate #2 have very close retrieval scores,
        prompts BharatGPT-3B Indic on Modal (or in RAM) to act as an authoritative engineering judge
        and confirm or select the winning standard.
        """
        if not self.is_available() or len(candidates) < 2:
            return None

        c_descriptions = []
        for idx, c in enumerate(candidates[:3]):
            fid = c.get("family_id", "N/A")
            raw_id = c.get("raw_id", fid)
            title = c.get("title_en", "")
            scope = c.get("scope_text", "")
            scope_str = f" (Scope: {scope})" if scope and len(scope) > 5 else ""
            c_descriptions.append(f"Option [{chr(65+idx)}]: {raw_id} - {title}{scope_str}")

        options_str = "\n".join(c_descriptions)

        prompt = (
            f"### Technical Standards Arbitration Directive:\n"
            f"You are the Bureau of Indian Standards Technical Advisory Judge.\n"
            f"Determine which Indian Standard specifically governs the given procurement requirement.\n\n"
            f"### Procurement Requirement:\n\"{tender_query}\"\n\n"
            f"### Candidate Standards:\n{options_str}\n\n"
            f"### Output format:\n"
            f"Selected Option: [A/B/C]\n"
            f"Standard: [IS Code]\n"
            f"Engineering Rationale: [One sentence rationale]\n\n"
            f"Selected Option:"
        )

        def _resolve_choice(out: str) -> Optional[int]:
            # 1. Match [A], Option A, or A
            m = re.search(r'(?:Option\s*|\[|\b)([A-C])(?:\]|\b)', out, re.IGNORECASE)
            if m:
                idx = ord(m.group(1).upper()) - 65
                if 0 <= idx < len(candidates[:3]):
                    return idx
            # 2. Match standard number in output (e.g. 8329 or 1536)
            out_lower = out.lower()
            for idx, c in enumerate(candidates[:3]):
                fid = c.get("family_id", "").lower()
                raw_id = c.get("raw_id", "").lower()
                num_only = re.sub(r'[^\d]', '', fid)
                if (fid and fid in out_lower) or (raw_id and raw_id in out_lower):
                    return idx
                if num_only and len(num_only) >= 3 and num_only in out_lower:
                    return idx
            return None

        if getattr(self, "_modal_url", None):
            try:
                import requests
                resp = requests.post(
                    f"{self._modal_url}/generate",
                    json={"prompt": prompt, "max_tokens": 90, "stop": ["###", "\n\n\n"], "temperature": 0.1},
                    timeout=45
                )
                if resp.status_code == 200:
                    output = resp.json().get("text", "").strip()
                    chosen_idx = _resolve_choice(output)
                    if chosen_idx is not None:
                        return {
                            "chosen_candidate": candidates[chosen_idx],
                            "rationale": output,
                            "model": "BharatGPT-3B-Indic Sovereign Judge (Modal)"
                        }
            except Exception as me:
                logger.warning(f"[BharatGPT-Modal] Arbitration failed ({me})")
                return None
            return None

        if not self.llm:
            return None

        try:
            with _INFERENCE_LOCK:
                response = self.llm(
                    prompt,
                    max_tokens=90,
                    stop=["###", "\n\n\n"],
                    temperature=0.1
                )
                output = response["choices"][0]["text"].strip()
                chosen_idx = _resolve_choice(output)
                if chosen_idx is not None:
                    return {
                        "chosen_candidate": candidates[chosen_idx],
                        "rationale": output,
                        "model": "BharatGPT-3B-Indic Sovereign Judge"
                    }
        except Exception as e:
            logger.warning(f"[BharatGPT Judge] Arbitration failed ({e}): using top statistical candidate.")
        return None

# Global singleton instance loaded once at startup
bharatgpt_engine = BharatGPTService()

