from typing import List, Dict, Any
from .base import VectorStore

try:
    from qdrant_client import QdrantClient
except ImportError:
    QdrantClient = None

class QdrantVectorStore(VectorStore):
    def __init__(self, host: str, port: int, collection_name: str):
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.client = QdrantClient(host=self.host, port=self.port) if QdrantClient else None

    def search(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        if not self.client:
            return []
            
        try:
            hits = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit
            )
            return [{"id": hit.id, "score": hit.score, "payload": hit.payload} for hit in hits]
        except Exception:
            return []

    def upsert(self, document_id: str, vector: List[float], payload: Dict[str, Any]):
        if not self.client:
            return
            
        try:
            from qdrant_client.http.models import PointStruct
            point = PointStruct(id=document_id, vector=vector, payload=payload)
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
        except Exception:
            pass
