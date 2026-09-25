import uuid
from schemas.api import ProcurementSessionCreateRequest, ProcurementSessionResponse
from repositories.session_repository import SessionRepository

class ProcurementSessionService:
    def __init__(self):
        self.repository = SessionRepository()

    def create_session(self, request: ProcurementSessionCreateRequest) -> ProcurementSessionResponse:
        session_id = str(uuid.uuid4())
        session = ProcurementSessionResponse(
            session_id=session_id,
            title=request.title,
            requirements=[],
            selected_standards=[],
            evidence=[],
            verification_state="PENDING",
            tender_findings=[]
        )
        return self.repository.create(session)

    def get_session(self, session_id: str) -> ProcurementSessionResponse:
        return self.repository.get(session_id)
