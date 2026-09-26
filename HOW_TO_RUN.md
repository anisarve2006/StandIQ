# 🚀 MaanakAI (मानक AI) — How to Run Guide
**Indian Standards Recommendation & Compliance Engine (SIH 26108)**

This document provides a step-by-step guide to setting up and running the complete **MaanakAI** full-stack application (FastAPI backend + Vite/React frontend), as well as running test tools and CLI auditors.

---

## 📋 Table of Contents
1. [System Prerequisites](#1-system-prerequisites)
2. [Quick Start (TL;DR)](#2-quick-start-tldr)
3. [Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
4. [Backend Setup (FastAPI + Python)](#4-backend-setup-fastapi--python)
5. [Database Setup (`standards.db`)](#5-database-setup-standardsdb)
6. [Running the Application (Full-Stack)](#6-running-the-application-full-stack)
7. [Running Test Suites & CLI Tools](#7-running-test-suites--cli-tools)
8. [Troubleshooting & Common Errors](#8-troubleshooting--common-errors)

---

## 1. System Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (tested with `v24.x`)
- **npm**: `v9.0.0` or higher (tested with `v11.x`)
- **Python**: `3.10`, `3.11`, or `3.12`
- **Git**

Verify your environment by running:
```powershell
node -v
npm -v
python --version
```

---

## 2. Quick Start (TL;DR)

Open two terminal windows:

### Terminal 1: Backend
```powershell
# Navigate to backend
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start backend API (runs on http://localhost:8000)
python api_service.py
```

### Terminal 2: Frontend
```powershell
# Navigate to frontend
cd frontend

# Install npm dependencies (CRITICAL: Must run before 'npm run dev')
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Visit **http://localhost:5173** in your browser!

---

## 3. Frontend Setup (React + Vite)

The frontend is built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **TanStack Query**.

### Step 1: Navigate to the `frontend` folder
```powershell
cd frontend
```

### Step 2: Install dependencies
> ⚠️ **Why did `npm run dev` fail with `'vite' is not recognized`?**  
> `node_modules` is not committed to git. You must run `npm install` first so Vite and all libraries are downloaded!

```powershell
npm install
```

### Step 3: (Optional) Configure Environment Variables
By default, the frontend connects to `http://localhost:8000`. If you need custom endpoints, create a `.env` file:
```powershell
copy .env.example .env
```
Inside `.env`:
```ini
VITE_API_BASE_URL=http://localhost:8000
```

### Step 4: Run the Development Server
```powershell
npm run dev
```
Output will show:
```
  VITE v8.3.0  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Frontend Commands Summary
| Command | Action |
| :--- | :--- |
| `npm install` | Installs all packages and dependencies |
| `npm run dev` | Starts local hot-reloading dev server on `http://localhost:5173` |
| `npm run build` | Compiles TypeScript and builds optimized production bundle to `dist/` |
| `npm run preview` | Locally serves and previews the production build |
| `npm run lint` | Runs Oxlint for ultra-fast static code analysis |

---

## 4. Backend Setup (FastAPI + Python)

The backend provides the hybrid search engine, BIS QCO verification kernel, Graph expander, and PDF BoQ compliance auditor.

### Step 1: Navigate to `backend`
```powershell
cd backend
```

### Step 2: Create and Activate a Virtual Environment
**PowerShell:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If on Windows Command Prompt `cmd.exe`: run `venv\Scripts\activate.bat`)*

> 💡 **Tip:** If PowerShell gives a policy error (`File cannot be loaded because running scripts is disabled`):
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> .\venv\Scripts\Activate.ps1
> ```

### Step 3: Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Create a local `.env` file from `.env.example`:
```powershell
copy .env.example .env
```
Key configuration settings in `.env`:
```ini
# LLM Configuration (Optional: Groq Cloud Provider)
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Storage Mode (Default SQLite is zero-configuration)
SQLITE_DB_PATH=data/standards.db

# FastEmbed ONNX Model (runs locally offline)
EMBED_MODEL=BAAI/bge-small-en-v1.5
RRF_K=60
```
*(Note: If you do not have a Groq API key, the engine automatically falls back to deterministic rule-based synthesis and local semantic search offline).*

### Step 5: Start the Backend Server
You can launch the server using either:
```powershell
python api_service.py
```
or via Uvicorn directly:
```powershell
uvicorn api_service:app --reload --host 0.0.0.0 --port 8000
```

Once running:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Alternative ReDoc:** `http://localhost:8000/redoc`

---

## 5. Database Setup (`standards.db`)

MaanakAI uses an SQLite database (`backend/data/standards.db`) equipped with **FTS5 full-text indexing**, an **Allied Standards Graph**, and **Compulsory QCO rules**.

Because large `.db` files are excluded from Git, you can populate the database using the built-in data pipeline:

### Option A: Complete Ingestion (~22,000 Standards + Live QCOs)
From the root directory:
```powershell
# 1. Download official Indian Standards catalogue from Archive.org
python -m backend.data_pipeline.fetch_standards

# 2. Populate SQLite database with standards, FTS5 index, and graph edges
python -m backend.data_pipeline.load_database
```
*Or run the all-in-one pipeline:*
```powershell
python data_pipeline/pipeline.py --all
```

### Option B: Quick Ingestion / Verification
To verify database health:
```powershell
python data_pipeline/pipeline.py --verify
```

---

## 6. Running the Application (Full-Stack)

With both services active:

| Service | Port | URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `5173` | [http://localhost:5173](http://localhost:5173) | Procurement Intelligence Dashboard & Interactive Workspace |
| **Backend API** | `8000` | [http://localhost:8000](http://localhost:8000) | FastAPI REST Endpoints |
| **Swagger Docs** | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API Explorer & Testing Interface |

### Main UI Workflow:
1. Open [http://localhost:5173](http://localhost:5173)
2. Go to **Dashboard** -> **New Procurement Session**
3. Enter specifications or trade terms in English, Hindi, or vernacular (e.g. `"12mm Fe 500D rebar"` or `"43 grade cement"`)
4. Discover matching standards, inspect mandatory QCO compliance, review supersessions, and generate compliant procurement clauses.

---

## 7. Running Test Suites & CLI Tools

MaanakAI comes with standalone CLI test tools located in the root repository:

### 1. Instant Multilingual Self-Test (`test_quick.py`)
Tests English, Hindi (Devanagari), Marathi, and Electrical items in under 3 seconds:
```powershell
# From the root directory (make sure backend is in PYTHONPATH):
$env:PYTHONPATH="backend"
python test_quick.py
```

### 2. Tender PDF Document Auditor (`test_pdf.py`)
Parses real Government / PSU Tender PDFs, extracts BoQ tables, and audits QCO compliance:
```powershell
$env:PYTHONPATH="backend"
python test_pdf.py "backend/data/sample_gem_tender.pdf"
```

### 3. Interactive Testing Console (`test_interactive.py`)
Launches an interactive prompt to test queries, trade terms, and documents:
```powershell
$env:PYTHONPATH="backend"
python test_interactive.py
```

### 4. Automated Pytest Suite
Runs full unit and integration tests:
```powershell
cd backend
pytest tests/ -v
```

---

## 8. Troubleshooting & Common Errors

### 1. `'vite' is not recognized as an internal or external command`
- **Cause:** You ran `npm run dev` before running `npm install`.
- **Solution:** 
  ```powershell
  cd frontend
  npm install
  npm run dev
  ```

### 2. `sqlite3.OperationalError: no such table: standards`
- **Cause:** `backend/data/standards.db` has not been initialized.
- **Solution:** Run the database build script:
  ```powershell
  python data_pipeline/pipeline.py --build-db
  ```

### 3. `File cannot be loaded because running scripts is disabled on this system`
- **Cause:** Windows PowerShell execution policy prevents executing virtual environment scripts.
- **Solution:** In your PowerShell terminal, run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\venv\Scripts\Activate.ps1
  ```
  *(Or activate via Command Prompt: `venv\Scripts\activate.bat`)*

### 4. `Port 8000 or Port 5173 is already in use`
- **Solution for Backend:** Specify another port:
  ```powershell
  uvicorn api_service:app --reload --port 8001
  ```
  *(Remember to update `VITE_API_BASE_URL=http://localhost:8001` in `frontend/.env`)*
- **Solution for Frontend:** Vite will automatically prompt to use the next available port (e.g. `5174`), or specify:
  ```powershell
  npm run dev -- --port 5175
  ```

---

### Need Help?
- Check [BRAIN.md](file:///e:/Main%20Projects/SIH-PS108/BRAIN.md) for architectural details and data models.
- Check [BACKEND_DEEP_AUDIT.md](file:///e:/Main%20Projects/SIH-PS108/BACKEND_DEEP_AUDIT.md) for endpoint capabilities and audit notes.
