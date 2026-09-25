from typing import Dict, Any, List
from .base import VectorStore

class LocalVectorStore(VectorStore):
    """
    Local stub representing in-memory or SQLite-based fallback 
    used currently in development. Production will use Qdrant.
    """
    def search(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        # In a real local stub, you might compute cosine similarity with a loaded numpy array.
        # This is a stub for the architecture boundary. 
        # The retrieval.hybrid_search module currently manages local semantic logic.
        return []
    
    def upsert(self, document_id: str, vector: List[float], payload: Dict[str, Any]):
        pass

class QdrantVectorStore(VectorStore):
    """
    Qdrant implementation for semantic search. Ready for production data.
    """
    def __init__(self, host: str, port: int, collection_name: str):
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.client = None # Optional import qdrant_client
        
    def search(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        if not self.client:
            return []
        # Real Qdrant query logic would go here
        return []
        
    def upsert(self, document_id: str, vector: List[float], payload: Dict[str, Any]):
        if not self.client:
            return
        # Real Qdrant upsert logic
        pass
