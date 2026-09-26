"""
Parallel Hybrid Retrieval Engine with Reciprocal Rank Fusion (RRF).
Architecture Layer 8, 12, 13, 14 & PDF Section 8, 13, 14.

Multi-channel parallel candidate retrieval:
1. Exact ID and Trade Term Lexicon Mapping
2. Multi-Tier SQLite FTS5 Full-Text Search with BM25 Ranking (`ORDER BY rank`)
   - Tier 1: Exact Keyphrase search
   - Tier 2: Conjunctive Boolean AND search
   - Tier 3: Disjunctive BM25 relevance search
3. Dense Semantic Cosine Rescoring via FastEmbed (BGE ONNX)
4. Reciprocal Rank Fusion (RRF) & Candidate Deduplication
"""

import os
import re
import sqlite3
import numpy as np
from typing import List, Dict, Any, Optional
from fastembed import TextEmbedding

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
SQLITE_DB = os.path.join(DATA_DIR, "standards.db")

STOP_WORDS = {
    "a", "an", "the", "and", "or", "of", "for", "with", "in", "on", "at", "by", "from",
    "up", "about", "into", "over", "after", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "shall", "will", "would",
    "should", "can", "could", "may", "might", "must", "per", "as", "to", "work", "need",
    "supply", "procurement", "item", "required", "specification", "specifications", "nos", "sets",
    "tender", "nit", "boq", "emd", "fdr", "bidding", "corrigendum", "enquiry", "providing", "fixing", "laying"
}

class HybridRetriever:
    def __init__(self, db_path: str = SQLITE_DB, embed_model_name: Optional[str] = None):
        self.db_path = db_path
        self.model_name = embed_model_name or os.environ.get("EMBED_MODEL_NAME", "BAAI/bge-small-en-v1.5")
        self._embedder = None

    @property
    def embedder(self) -> TextEmbedding:
        if self._embedder is None:
            self._embedder = TextEmbedding(self.model_name)
        return self._embedder

    def get_db_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def search_exact(self, query_obj: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Path A: Exact ID and Trade Term Matching."""
        results = []
        conn = self.get_db_connection()
        cur = conn.cursor()

        # 1. Direct family_id matches from parsed IS numbers
        for is_info in query_obj.get("exact_is", []):
            fid = is_info.get("family_id")
            num = is_info.get("number")
            cur.execute("""
            SELECT family_id, raw_id, title_en, scope_text, year, division, committee, status, num_amendments, tier, pdf_url
            FROM standards 
            WHERE family_id = ? OR number = ? LIMIT 5;
            """, (fid, num))
            for row in cur.fetchall():
                item = dict(row)
                item["source_channel"] = "EXACT_ID"
                results.append(item)

        # 2. Trade lexicon direct mappings
        for tm in query_obj.get("trade_matches", []):
            fid = tm.get("family_id")
            num = fid.replace("IS:", "").split(":")[0] if fid else ""
            cur.execute("""
            SELECT family_id, raw_id, title_en, scope_text, year, division, committee, status, num_amendments, tier, pdf_url
            FROM standards 
            WHERE family_id = ? OR number = ? LIMIT 1;
            """, (fid, num))
            row = cur.fetchone()
            if row:
                item = dict(row)
                item["source_channel"] = "TRADE_LEXICON"
                results.append(item)

        conn.close()
        return results

    def _extract_keywords(self, text: str) -> List[str]:
        """Cleans and extracts meaningful technical search terms."""
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        words = [w for w in clean.split() if len(w) > 2 and w not in STOP_WORDS]
        # De-duplicate while preserving order
        seen = set()
        res = []
        for w in words:
            if w not in seen:
                seen.add(w)
                res.append(w)
        return res

    def search_lexical(self, search_text: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Path B: Multi-Tier SQLite FTS5 Full-Text Lexical Search with BM25 Ranking.
        Executes progressive search:
        - Tier 1: Multi-word phrase search
        - Tier 2: Boolean AND query
        - Tier 3: BM25 OR ranking
        """
        keywords = self._extract_keywords(search_text)
        if not keywords:
            return []

        results = []
        seen_fids = set()
        conn = self.get_db_connection()
        cur = conn.cursor()

        # Query builder for FTS5
        def execute_fts(query_str: str, max_rows: int):
            try:
                cur.execute("""
                SELECT s.family_id, s.raw_id, s.title_en, s.scope_text, s.year, s.division, s.committee, 
                       s.status, s.num_amendments, s.tier, s.pdf_url, f.rank as bm25_rank
                FROM standards_fts f
                JOIN standards s ON f.family_id = s.family_id
                WHERE standards_fts MATCH ?
                ORDER BY f.rank ASC
                LIMIT ?;
                """, (query_str, max_rows))
                for row in cur.fetchall():
                    item = dict(row)
                    fid = item["family_id"]
                    if fid not in seen_fids:
                        seen_fids.add(fid)
                        item["source_channel"] = "LEXICAL_BM25"
                        results.append(item)
            except Exception:
                pass

        # 1. Tier 1: Try adjacent keyphrase if 2+ keywords
        if len(keywords) >= 2:
            phrase = f'"{keywords[0]} {keywords[1]}"'
            execute_fts(phrase, max_rows=15)

        # 2. Tier 2: Strict boolean AND of top 3-4 keywords
        if len(keywords) >= 2:
            and_query = " AND ".join(keywords[:4])
            execute_fts(and_query, max_rows=25)

        # 3. Tier 3: Disjunctive BM25 ranking across all keywords
        or_query = " OR ".join(keywords[:6])
        execute_fts(or_query, max_rows=limit)

        conn.close()
        return results

    def _get_embedding(self, text: str) -> np.ndarray:
        if not hasattr(self, "_embedding_cache"):
            self._embedding_cache = {}
        if text not in self._embedding_cache:
            vec = list(self.embedder.embed([text]))[0]
            norm = np.linalg.norm(vec)
            self._embedding_cache[text] = vec / norm if norm > 0 else vec
        return self._embedding_cache[text]

    def search_semantic(self, query_text: str, candidate_pool: List[Dict[str, Any]], top_k: int = 15) -> List[Dict[str, Any]]:
        """Path C: Dense Semantic Rescoring over Candidates using FastEmbed (BGE) with vector caching."""
        if not candidate_pool:
            return []

        # Only evaluate top 12 candidates on CPU to keep latency under 150ms
        pool_to_score = candidate_pool[:12]
        query_vec = self._get_embedding(query_text)

        scored_candidates = []
        for cand in pool_to_score:
            title = f"{cand.get('title_en', '')} {cand.get('division', '')}".strip()
            cvec = self._get_embedding(title)
            sim = float(np.dot(query_vec, cvec))
            item = dict(cand)
            item["semantic_score"] = round(sim, 4)
            scored_candidates.append(item)

        scored_candidates.sort(key=lambda x: x["semantic_score"], reverse=True)
        return scored_candidates[:top_k]

    def rrf_fusion(self, ranked_lists: List[List[Dict[str, Any]]], k: int = 60, weights: Optional[List[float]] = None) -> List[Dict[str, Any]]:
        """Reciprocal Rank Fusion (RRF) over multiple retrieval channels."""
        if weights is None:
            weights = [1.0] * len(ranked_lists)

        scores = {}
        candidate_meta = {}

        for ch_idx, candidates in enumerate(ranked_lists):
            w = weights[ch_idx] if ch_idx < len(weights) else 1.0
            for rank, item in enumerate(candidates):
                fid = item.get("family_id")
                if not fid:
                    continue
                if fid not in scores:
                    scores[fid] = 0.0
                    candidate_meta[fid] = dict(item)

                scores[fid] += w / (k + rank + 1)

        fused = []
        for fid, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            entry = candidate_meta[fid]
            entry["rrf_score"] = round(score, 5)
            fused.append(entry)

        return fused

    def retrieve(self, query_obj: Dict[str, Any], top_n: int = 35) -> List[Dict[str, Any]]:
        """Orchestrates parallel multi-path candidate retrieval and fusion."""
        # 1. Exact match path
        exact_candidates = self.search_exact(query_obj)
        
        # 2. Lexical FTS path (Multi-tier phrase + AND + BM25)
        lexical_candidates = self.search_lexical(query_obj["search_text"], limit=60)

        # 3. Dense semantic candidate pool (Adaptive Compute: embed max 4 if exact match present, else 10)
        pool = {c["family_id"]: c for c in (exact_candidates + lexical_candidates)}.values()
        semantic_limit = 4 if exact_candidates else 10
        semantic_candidates = self.search_semantic(query_obj["search_text"], list(pool), top_k=semantic_limit)

        # 4. RRF Fusion: (Exact = 3.5 weight, Semantic = 1.5 weight, Lexical = 1.2 weight)
        fused = self.rrf_fusion(
            [exact_candidates, semantic_candidates, lexical_candidates],
            k=60,
            weights=[3.5, 1.5, 1.2]
        )

        return fused[:top_n]
