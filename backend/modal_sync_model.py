"""
Cloud-to-Cloud Model Downloader for Modal Volume.
Transfers BharatGPT-3B-Indic.Q8_0.gguf directly into Modal's persistent volume
at datacenter speeds (10 Gbps) bypassing slow local broadband uploads.

Usage examples:
  1. From direct link / S3 / Dropbox:
     modal run modal_sync_model.py --mode direct --source "https://your-domain.com/BharatGPT-3B-Indic.Q8_0.gguf"

  2. From Google Drive:
     modal run modal_sync_model.py --mode gdrive --source "YOUR_GOOGLE_DRIVE_FILE_ID"

  3. From Hugging Face Hub:
     modal run modal_sync_model.py --mode hf --source "user/repo-name" --filename "BharatGPT-3B-Indic.Q8_0.gguf"
"""

import os
import modal

app = modal.App("maanak-model-sync")

# Persistent Modal volume for model weights
model_volume = modal.Volume.from_name("bharatgpt-model-vol", create_if_missing=True)
VOL_MOUNT_PATH = "/models"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("requests", "tqdm", "gdown", "huggingface_hub")
)

@app.function(
    image=image,
    volumes={VOL_MOUNT_PATH: model_volume},
    timeout=1200,  # 20 minutes limit
)
def download_model(mode: str, source: str, filename: str = "BharatGPT-3B-Indic.Q8_0.gguf"):
    dest_path = f"{VOL_MOUNT_PATH}/{filename}"
    print(f"🚀 Starting cloud-to-cloud transfer [mode={mode}] to {dest_path}...")

    if mode == "direct":
        import requests
        from tqdm import tqdm

        # Handle Dropbox shared links by forcing dl=1
        if "dropbox.com" in source and "?dl=0" in source:
            source = source.replace("?dl=0", "?dl=1")

        with requests.get(source, stream=True, timeout=30) as r:
            r.raise_for_status()
            total_size = int(r.headers.get("content-length", 0))

            with open(dest_path, "wb") as f, tqdm(
                desc=filename,
                total=total_size,
                unit="iB",
                unit_scale=True,
                unit_divisor=1024,
            ) as bar:
                for chunk in r.iter_content(chunk_size=1024 * 1024 * 8):  # 8MB chunk buffer
                    if chunk:
                        f.write(chunk)
                        bar.update(len(chunk))

    elif mode == "gdrive":
        import re
        # pyrefly: ignore [missing-import]
        import gdown
        print(f"📥 Fetching from Google Drive: {source}...")
        file_id = source.strip()
        if "drive.google.com" in source:
            match = re.search(r"/d/([a-zA-Z0-9_-]+)", source) or re.search(r"id=([a-zA-Z0-9_-]+)", source)
            if match:
                file_id = match.group(1)
        download_url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url=download_url, output=dest_path, quiet=False)

    elif mode == "hf":
        import shutil
        from huggingface_hub import hf_hub_download
        print(f"📥 Downloading from Hugging Face repo {source} -> {filename}...")
        cached_file = hf_hub_download(repo_id=source, filename=filename)
        shutil.copy(cached_file, dest_path)

    else:
        raise ValueError(f"Unknown mode: {mode}. Choose from 'direct', 'gdrive', or 'hf'.")

    # Commit changes permanently to the Modal Volume
    model_volume.commit()
    file_size_gb = os.path.getsize(dest_path) / (1024 ** 3)
    print(f"✅ Model successfully saved! Location: {dest_path} ({file_size_gb:.2f} GB)")
    return {"status": "success", "path": dest_path, "size_gb": file_size_gb}

@app.local_entrypoint()
def main(mode: str = "direct", source: str = "", filename: str = "BharatGPT-3B-Indic.Q8_0.gguf"):
    if not source:
        print("❌ Error: --source argument is required.")
        print("Example: modal run modal_sync_model.py --mode direct --source \"https://example.com/model.gguf\"")
        return
    download_model.remote(mode=mode, source=source, filename=filename)
