from typing import Dict, Optional
import uuid
from schemas.api import ProcurementSessionResponse
from .base import SessionRepository

class InMemorySessionRepository(SessionRepository):
    def __init__(self):
        self.sessions: Dict[str, ProcurementSessionResponse] = {}

    def create(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        self.sessions[session.session_id] = session
        return session

    def get(self, session_id: str) -> Optional[ProcurementSessionResponse]:
        return self.sessions.get(session_id)

    def update(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        if session.session_id in self.sessions:
            self.sessions[session.session_id] = session
        return session
