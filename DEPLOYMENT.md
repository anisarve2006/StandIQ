# 🚀 MaanakAI Deployment Guide (SIH 26108)

This guide covers deploying the complete **MaanakAI** full-stack application (React 19 Frontend + FastAPI Backend) across **Modal (Serverless GPU)**, **Docker Compose**, and **Cloud PaaS (Vercel + Render)**.

---

## 📑 Deployment Architectures at a Glance

| Deployment Target | Where Model Runs | RAM Needed | Setup Time | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **A. Modal + Docker/Cloud** | Serverless T4 GPU on Modal | < 1 GB on host | ~5 mins | **Recommended (Best performance & scale-to-zero)** |
| **B. Docker Compose (Single VM)** | Local CPU / Groq / Modal | 2 GB – 8 GB | ~3 mins | **VPS, AWS EC2, DigitalOcean, On-Prem** |
| **C. Vercel + Render** | Groq Cloud API | < 512 MB | ~5 mins | **Free-tier cloud testing** |

---

## ⚡ Method 1: Deploying BharatGPT on Modal (Serverless GPU)

Modal hosts the 3.78 GB `BharatGPT-3B-Indic.Q8_0.gguf` model on an NVIDIA T4/L4 GPU, scaling down to zero when idle.

### Step 1: Install and authenticate Modal
```bash
pip install modal
modal setup
```

### Step 2: Cloud-to-Cloud Model Transfer (Bypasses slow home upload)
Run the built-in transfer script inside Modal's 10 Gbps cloud network:

- **From a Direct URL / S3 / Dropbox:**
  ```bash
  cd backend
  modal run modal_sync_model.py --mode direct --source "https://your-domain.com/BharatGPT-3B-Indic.Q8_0.gguf"
  ```
- **From Google Drive:**
  ```bash
  modal run modal_sync_model.py --mode gdrive --source "YOUR_GOOGLE_DRIVE_FILE_ID"
  ```
- **From Hugging Face:**
  ```bash
  modal run modal_sync_model.py --mode hf --source "user/repo-name" --filename "BharatGPT-3B-Indic.Q8_0.gguf"
  ```

Check that the model exists in the volume:
```bash
modal volume ls bharatgpt-model-vol
```

### Step 3: Deploy the BharatGPT GPU Service
```bash
modal deploy modal_bharatgpt.py
```
Modal will print your permanent HTTPS URL:
```text
✓ Created web endpoint: https://<username>--maanak-bharatgpt-bharatgptservice-generate.modal.run
```
*(Base URL: `https://<username>--maanak-bharatgpt-bharatgptservice.modal.run`)*

### Step 4: Point Your Backend to Modal
Add to your backend `.env`:
```env
USE_GROQ=false
USE_BHARATGPT=true
BHARATGPT_MODAL_URL=https://<username>--maanak-bharatgpt-bharatgptservice.modal.run
```

---

## 🐳 Method 2: Full-Stack Deployment with Docker Compose

A single command builds and runs both Frontend (served via Nginx) and Backend (FastAPI).

### Step 1: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your desired LLM provider in `.env`:
- **If using Modal:** set `BHARATGPT_MODAL_URL=https://...`
- **If using Groq:** set `USE_GROQ=true` and `GROQ_API_KEY=gsk_...`

### Step 2: Build and Launch
```bash
docker compose up -d --build
```

### Step 3: Access the Services
- **Web Application**: `http://localhost` (or your server's public IP on port 80)
- **API Documentation (Swagger)**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`

### Step 4: Stop Containers
```bash
docker compose down
```

---

## ☁️ Method 3: Cloud PaaS (Frontend on Vercel + Backend on Render)

### Backend (Render / Railway)
1. Exclude `.gguf` files from git (already in `.gitignore` & `.dockerignore`).
2. Connect your repo to [Render](https://render.com) and create a **Web Service**.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api_service:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `USE_GROQ=true`
   - `GROQ_API_KEY=your_groq_api_key`
   - `GROQ_MODEL=llama-3.3-70b-versatile`
   - *(Or set `BHARATGPT_MODAL_URL` if you deployed Modal)*
5. Note your backend URL (e.g. `https://maanak-api.onrender.com`).

### Frontend (Vercel)
1. Import the repository in [Vercel](https://vercel.com).
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL=https://maanak-api.onrender.com`
4. Deploy!

---

## 🔍 Verification & Health Checks

Once deployed, verify everything is functional:

1. **System Health & LLM Status:**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```
   *Expected response:*
   ```json
   {
     "status": "healthy",
     "version": "3.0.0",
     "database": "data/standards.db",
     "sovereign_llm": {
       "available": true,
       "backend": "Modal Serverless GPU"
     }
   }
   ```

2. **Run a Test Recommendation Query:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/recommend \
     -H "Content-Type: application/json" \
     -d '{"query": "Supply of 1200 meters Ductile Iron Class K7 pipes DN 200mm"}'
   ```
