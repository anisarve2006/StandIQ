import pytest
from repositories.session_repository import SQLiteSessionRepository
from schemas.api import ProcurementSessionResponse
from schemas.domain import Requirement, RequirementCategory

def test_sqlite_session_repository_persistence(test_db_path):
    repo1 = SQLiteSessionRepository(test_db_path)
    
    session = ProcurementSessionResponse(
        session_id="test-session-persistent-101",
        title="High Grade Structural Cement Procurement",
        requirements=[
            Requirement(
                category=RequirementCategory.PRODUCT,
                name="Product",
                source_text="Ordinary Portland Cement 43 Grade"
            )
        ],
        selected_standards=[{"family_id": "IS:8112"}],
        evidence=[],
        verification_state="VERIFIED",
        tender_findings=[]
    )
    
    # 1. Create and verify in repo1
    created = repo1.create(session)
    assert created.session_id == "test-session-persistent-101"
    assert created.title == "High Grade Structural Cement Procurement"
    
    fetched1 = repo1.get("test-session-persistent-101")
    assert fetched1 is not None
    assert fetched1.title == "High Grade Structural Cement Procurement"
    assert fetched1.requirements[0].source_text == "Ordinary Portland Cement 43 Grade"
    
    # 2. Simulate server restart with a new repository instance pointing to same DB
    repo2 = SQLiteSessionRepository(test_db_path)
    fetched2 = repo2.get("test-session-persistent-101")
    assert fetched2 is not None
    assert fetched2.session_id == "test-session-persistent-101"
    assert fetched2.title == "High Grade Structural Cement Procurement"
    assert fetched2.verification_state == "VERIFIED"
    
    # 3. Backwards compatibility dict interface
    assert "test-session-persistent-101" in repo2.sessions
    assert repo2.sessions["test-session-persistent-101"].title == "High Grade Structural Cement Procurement"
    
    # 4. Update session
    fetched2.verification_state = "COMPLETED"
    repo2.update(fetched2)
    
    # Verify update in another fresh instance
    repo3 = SQLiteSessionRepository(test_db_path)
    assert repo3.get("test-session-persistent-101").verification_state == "COMPLETED"
