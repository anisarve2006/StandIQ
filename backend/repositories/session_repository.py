from typing import Dict
import uuid
from schemas.api import ProcurementSessionResponse

class SessionRepository:
    def __init__(self):
        self.sessions: Dict[str, ProcurementSessionResponse] = {}

    def create(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        self.sessions[session.session_id] = session
        return session

    def get(self, session_id: str) -> ProcurementSessionResponse:
        return self.sessions.get(session_id)

    def update(self, session: ProcurementSessionResponse) -> ProcurementSessionResponse:
        if session.session_id in self.sessions:
            self.sessions[session.session_id] = session
        return session
