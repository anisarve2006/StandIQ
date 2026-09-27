from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List

class StandardRepository(ABC):
    @abstractmethod
    def get_standard_by_family_id(self, family_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def get_versions(self, family_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_amendments(self, family_id: str) -> List[Dict[str, Any]]:
        pass


class RegulatoryRepository(ABC):
    @abstractmethod
    def get_certification_rules(self, family_id: str) -> List[Dict[str, Any]]:
        pass

class GraphRepository(ABC):
    @abstractmethod
    def get_allied_standards(self, family_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        pass

class VectorStore(ABC):
    @abstractmethod
    def search(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def upsert(self, document_id: str, vector: List[float], payload: Dict[str, Any]):
        pass

class SessionRepository(ABC):
    @abstractmethod
    def create(self, session: Any) -> Any:
        pass
        
    @abstractmethod
    def get(self, session_id: str) -> Optional[Any]:
        pass
        
    @abstractmethod
    def update(self, session: Any) -> Any:
        pass
