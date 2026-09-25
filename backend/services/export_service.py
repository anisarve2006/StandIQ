import json
from schemas.api import ExportRequest, ExportResponse
from services.procurement_session_service import ProcurementSessionService

class ExportService:
    def __init__(self, session_service: ProcurementSessionService):
        self.session_service = session_service

    def export(self, request: ExportRequest) -> ExportResponse:
        session = self.session_service.get_session(request.session_id)
        if not session:
            raise ValueError(f"Session {request.session_id} not found.")

        if request.format.lower() == "json":
            content = session.model_dump_json(indent=2)
            content_type = "application/json"
        elif request.format.lower() == "markdown":
            lines = [f"# Procurement Session: {session.title}"]
            lines.append(f"## Status: {session.verification_state}")
            if session.generated_specification:
                lines.append("\n## Specification Clause")
                lines.append(session.generated_specification)
            content = "\n".join(lines)
            content_type = "text/markdown"
        else:
            raise ValueError(f"Unsupported export format: {request.format}")

        return ExportResponse(
            content=content,
            content_type=content_type
        )
