# MaanakAI (SIH 26108)

Frontend:
React + TypeScript + Vite procurement intelligence workspace.

Backend:
Python + FastAPI MaanakAI retrieval and verification engine.

Current status:
Backend is **APPLICATION-LAYER COMPLETE**, featuring hardened intelligent APIs ready for UI usage. Production Data (PostgreSQL, Qdrant, Neo4j) is currently stubbed by SQLite.
Frontend and backend consolidated into one repository.
**API integration is the next engineering stage.**

For detailed setup instructions, troubleshooting, and test scripts, see **[HOW_TO_RUN.md](file:///e:/Main%20Projects/SIH-PS108/HOW_TO_RUN.md)**.

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
# Activate venv
pip install -r requirements.txt
uvicorn api_service:app --reload
```

## Structure
- `frontend/`: Standalone React application.
- `backend/`: FastAPI AI backend and data pipeline.
- `BRAIN.md`: Project architecture and source of truth.
