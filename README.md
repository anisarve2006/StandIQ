# MaanakAI (SIH 26108)

Frontend:
React + TypeScript + Vite procurement intelligence workspace.

Backend:
Python + FastAPI MaanakAI retrieval and verification engine.

Current status:
Frontend and backend consolidated into one repository.
API integration is the next engineering stage.

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
