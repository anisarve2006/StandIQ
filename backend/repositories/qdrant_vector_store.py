"""
Production Qdrant Vector Store Repository.
Dual-mode:
- Production Mode: Connects to distributed Qdrant cluster / cloud instance via host/port/url.
- Sovereign Air-Gapped Mode: Runs embedded in-process Qdrant with true HNSW vector index.
"""

import os
import sqlite3
import numpy as np
from typing import List, Dict, Any, Optional
from loguru import logger
from .base import VectorStore

try:
    from qdrant_client import QdrantClient
    from qdrant_client.http.models import PointStruct, VectorParams, Distance
    HAS_QDRANT = True
except ImportError:
    HAS_QDRANT = False
    QdrantClient = None

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "standards.db")
NPZ_PATH = os.path.join(DATA_DIR, "standards_vector_index.npz")

class QdrantVectorStore(VectorStore):
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        collection_name: str = "indian_standards",
        use_embedded: bool = True
    ):
        self.collection_name = collection_name
        self.host = host or os.getenv("QDRANT_HOST")
        self.port = port or int(os.getenv("QDRANT_PORT", "6333"))
        self.client = None
        self.mode = "UNINITIALIZED"
        self._init_client(use_embedded=use_embedded)

    def _init_client(self, use_embedded: bool = True):
        if not HAS_QDRANT:
            logger.warning("[Qdrant] qdrant-client package not installed. Running in degraded mode.")
            self.mode = "DEGRADED"
            return

        # 1. Attempt connection to remote Qdrant cluster if host specified
        if self.host and self.host not in ["localhost", "127.0.0.1", "none"]:
            try:
                self.client = QdrantClient(host=self.host, port=self.port, timeout=3.0)
                # Verify connection
                self.client.get_collections()
                self.mode = "REMOTE_CLUSTER"
                logger.info(f"[Qdrant] Connected to remote Qdrant cluster at {self.host}:{self.port}")
                return
            except Exception as e:
                logger.warning(f"[Qdrant] Remote cluster unreachable ({e}). Falling back to Embedded Sovereign Mode.")

        # 2. Embedded In-Process Qdrant (Sovereign Air-Gapped Mode)
        try:
            # In-memory HNSW vector index
            self.client = QdrantClient(":memory:")
            self.mode = "EMBEDDED_IN_MEMORY"
            self._bootstrap_collection()
            logger.info(f"[Qdrant] Initialized Embedded Sovereign Qdrant Vector Engine with HNSW index.")
        except Exception as e:
            logger.error(f"[Qdrant] Failed to initialize embedded engine: {e}")
            self.mode = "ERROR"

    def _bootstrap_collection(self):
        """Creates collection and indexes all standards with precomputed vectors."""
        if not self.client:
            return

        try:
            # Check or create collection
            collections = [c.name for c in self.client.get_collections().collections]
            if self.collection_name not in collections:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )

            # Load vectors from precomputed index
            if os.path.exists(NPZ_PATH):
                data = np.load(NPZ_PATH, allow_pickle=True)
                fids = list(data["family_ids"])
                matrix = data["vectors"]

                # Fetch metadata from SQLite
                meta_map = {}
                if os.path.exists(DB_PATH):
                    conn = sqlite3.connect(DB_PATH)
                    cur = conn.cursor()
                    cur.execute("SELECT family_id, raw_id, title_en, division, status, year FROM standards")
                    for row in cur.fetchall():
                        meta_map[row[0]] = {
                            "family_id": row[0],
                            "raw_id": row[1],
                            "title_en": row[2],
                            "division": row[3],
                            "status": row[4],
                            "year": row[5]
                        }
                    conn.close()

                points = []
                for idx, fid in enumerate(fids):
                    payload = meta_map.get(fid, {"family_id": fid})
                    points.append(PointStruct(
                        id=idx + 1,
                        vector=matrix[idx].tolist(),
                        payload=payload
                    ))

                if points:
                    self.client.upsert(collection_name=self.collection_name, points=points)
                    logger.info(f"[Qdrant] Seeded {len(points)} vector embeddings into collection '{self.collection_name}'.")
        except Exception as e:
            logger.warning(f"[Qdrant] Bootstrap seeding exception: {e}")

    def search(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """Dense semantic HNSW vector search over indexed standards."""
        if not self.client:
            return []

        try:
            # Try modern query_points API first, fallback to search
            if hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    limit=limit
                )
                hits = response.points
                return [{"id": hit.id, "score": hit.score, "payload": hit.payload} for hit in hits]
            elif hasattr(self.client, "search"):
                hits = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    limit=limit
                )
                return [{"id": hit.id, "score": hit.score, "payload": hit.payload} for hit in hits]
            return []
        except Exception as e:
            logger.warning(f"[Qdrant] Search failed ({e})")
            return []

    def upsert(self, document_id: str, vector: List[float], payload: Dict[str, Any]):
        if not self.client:
            return

        try:
            # Generate deterministic int ID if alphanumeric
            point_id = abs(hash(document_id)) % (2**63 - 1)
            point = PointStruct(id=point_id, vector=vector, payload=payload)
            self.client.upsert(collection_name=self.collection_name, points=[point])
        except Exception as e:
            logger.warning(f"[Qdrant] Upsert error: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Returns live system telemetry for health check."""
        count = 0
        if self.client:
            try:
                info = self.client.get_collection(self.collection_name)
                count = getattr(info, "points_count", getattr(info, "vectors_count", 0)) or 0
            except Exception:
                pass

        return {
            "status": "LIVE" if self.client else "OFFLINE",
            "engine": "Qdrant HNSW Vector Store",
            "mode": self.mode,
            "collection": self.collection_name,
            "dimension": 384,
            "distance": "Cosine",
            "vectors_count": count
        }

# Global singleton instance
qdrant_store = QdrantVectorStore()
