"""
BharatGPT-3B Indic Model Serving on Modal with Serverless CPU Acceleration.
Runs llama-cpp-python on dedicated vCPUs with 8 GB RAM and auto-scale to zero.

Deployment commands:
  1. Test locally via ephemeral dev container:
     modal serve modal_bharatgpt.py

  2. Deploy to production (outputs permanent HTTPS URL):
     modal deploy modal_bharatgpt.py
"""

import os
import modal

app = modal.App("maanak-bharatgpt")

# 1. Mount persistent volume containing BharatGPT-3B-Indic.Q8_0.gguf
model_volume = modal.Volume.from_name("bharatgpt-model-vol", create_if_missing=True)
VOL_PATH = "/models"
MODEL_FILENAME = "BharatGPT-3B-Indic.Q8_0.gguf"
MODEL_PATH = f"{VOL_PATH}/{MODEL_FILENAME}"

# 2. Build CPU-optimized container image with AVX2 support
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("build-essential", "cmake", "curl", "git")
    .pip_install(
        "llama-cpp-python",
        "fastapi[standard]",
        "pydantic",
        extra_index_url="https://abetlen.github.io/llama-cpp-python/whl/cpu"
    )
)

@app.cls(
    image=image,
    cpu=4.0,                          # 4 dedicated vCPUs (100% free on Modal, no credit card required)
    memory=8192,                      # 8 GB RAM (plenty of room for 3.19 GB model + KV cache)
    volumes={VOL_PATH: model_volume},
    scaledown_window=300,             # Keep warm for 5 minutes (300s) after last request
)
class BharatGPTService:
    @modal.enter()
    def load_model(self):
        from llama_cpp import Llama

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Run `modal run modal_sync_model.py ...` first to download the weights into the volume."
            )

        print(f"🚀 Loading {MODEL_FILENAME} into RAM (CPU AVX2, 4 threads)...")
        self.llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=2048,
            n_threads=4,              # Multi-threading across all 4 vCPUs
            n_gpu_layers=0,           # CPU mode
            verbose=False
        )
        print("✅ BharatGPT-3B is warm and ready on Modal CPU!")

    @modal.asgi_app()
    def serve(self):
        from fastapi import FastAPI
        web_app = FastAPI(title="MaanakAI BharatGPT Sovereign LLM Endpoint")

        @web_app.get("/health")
        def health():
            return {
                "status": "healthy",
                "model": MODEL_FILENAME,
                "gpu": False,
                "engine": "llama-cpp-python (CPU AVX2, 4 vCPUs)"
            }

        @web_app.post("/generate")
        def generate(payload: dict):
            prompt = payload.get("prompt", "")
            max_tokens = payload.get("max_tokens", 256)
            temperature = payload.get("temperature", 0.1)
            stop = payload.get("stop", ["###", "\n\n"])

            output = self.llm(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                stop=stop
            )
            return {
                "text": output["choices"][0]["text"].strip(),
                "usage": output.get("usage", {})
            }

        @web_app.post("/translate")
        def translate(payload: dict):
            masked_text = payload.get("masked_text", "")
            script_name = payload.get("script_name", "devanagari")

            prompt = (
                f"### Instruction:\n"
                f"Translate the following Indian procurement tender text into technical English.\n"
                f"STRICT RULES:\n"
                f"1. Keep all placeholder tokens like __TECH_PARAM_0__, __TECH_PARAM_1__ exactly as they are without modifying or dropping them.\n"
                f"2. Return ONLY the English translation without preamble, quotation marks, or explanations.\n\n"
                f"### Input ({script_name}):\n{masked_text}\n\n"
                f"### English Translation:\n"
            )

            output = self.llm(prompt, max_tokens=80, stop=["###", "\n\n", "### Input"], temperature=0.1)
            text = output["choices"][0]["text"].strip().strip('"\'')
            return {"translated_text": text}

        @web_app.post("/canonicalize")
        def canonicalize(payload: dict):
            text = payload.get("text", "")

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

            output = self.llm(prompt, max_tokens=60, stop=["\n", "###", "Input:"], temperature=0.1)
            res = output["choices"][0]["text"].strip().strip('"\'')
            return {"canonical_title": res}

        @web_app.post("/draft_clause")
        def draft_clause(payload: dict):
            product_name = payload.get("product_name", "")
            standard_id = payload.get("standard_id", "")
            standard_title = payload.get("standard_title", "")
            param_str = payload.get("parameters", "Standard commercial grades")
            cert_str = payload.get("certification_info", "Standard quality compliance")

            prompt = (
                f"### Instruction:\n"
                f"Draft a formal, concise 5-point procurement specification clause for the Government e-Marketplace (GeM) conforming to the Bureau of Indian Standards (BIS).\n\n"
                f"### Product: {product_name}\n"
                f"### Indian Standard: {standard_id} ({standard_title})\n"
                f"### Technical Parameters: {param_str}\n"
                f"### Certification: {cert_str}\n\n"
                f"### 5-Point GeM Specification Clause:\n"
            )

            output = self.llm(prompt, max_tokens=220, stop=["###", "\n\n\n"], temperature=0.2)
            clause = output["choices"][0]["text"].strip()
            return {"clause": clause}

        return web_app
