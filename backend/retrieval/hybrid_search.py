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

from db.connection import get_sqlite_connection

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
SQLITE_DB = os.path.join(DATA_DIR, "standards.db")

STOP_WORDS = {
    "a", "an", "the", "and", "or", "of", "for", "with", "in", "on", "at", "by", "from",
    "up", "about", "into", "over", "after", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "shall", "will", "would",
    "should", "can", "could", "may", "might", "must", "per", "as", "to", "work", "works", "need",
    "supply", "supplying", "supplied", "procurement", "item", "items", "required", "requirement",
    "specification", "specifications", "nos", "sets", "tender", "nit", "boq", "emd", "fdr",
    "bidding", "corrigendum", "enquiry", "providing", "fixing", "laying", "installing",
    "installation", "commissioning", "fabricating", "fabrication", "erecting", "erection",
    "testing", "manufacturing", "delivery", "execution", "approved", "make", "makes",
    "direction", "engineer", "charge", "complete", "including", "excluding", "all", "both",
    "internal", "external", "such", "other", "etc", "like", "any", "having", "type", "good"
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
        return get_sqlite_connection(self.db_path)

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
            SELECT family_id, raw_id, title_en, scope_text, year, division, committee, status, num_amendments, tier, pdf_url,
                   product_type, domain, material, application, standard_type, is_test_standard, related_products
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
            SELECT family_id, raw_id, title_en, scope_text, year, division, committee, status, num_amendments, tier, pdf_url,
                   product_type, domain, material, application, standard_type, is_test_standard, related_products
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
        """Cleans and extracts meaningful technical search terms, filtering boilerplate and pure digits."""
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        words = [w for w in clean.split() if len(w) > 2 and w not in STOP_WORDS and not w.isdigit()]
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
        Path B: Multi-Tier SQLite FTS5 Full-Text Lexical Search with Title-Weighted BM25 Ranking.
        Executes progressive search:
        - Tier 1: Multi-word adjacent phrase search (top technical nouns)
        - Tier 2: Boolean AND query across primary nouns
        - Tier 3: Title-Weighted BM25 OR ranking across all substantive keywords (up to 15)
        """
        keywords = self._extract_keywords(search_text)
        if not keywords:
            return []

        results = []
        seen_fids = set()
        conn = self.get_db_connection()
        cur = conn.cursor()

        # Query builder for FTS5 with column-weighted BM25: Title weighted 8x over scope/division
        def execute_fts(query_str: str, max_rows: int):
            try:
                cur.execute("""
                SELECT s.family_id, s.raw_id, s.title_en, s.scope_text, s.year, s.division, s.committee, 
                       s.status, s.num_amendments, s.tier, s.pdf_url,
                       s.product_type, s.domain, s.material, s.application, s.standard_type, s.is_test_standard, s.related_products,
                       bm25(standards_fts, 10.0, 10.0, 8.0, 1.0, 1.0) as bm25_rank
                FROM standards_fts f
                JOIN standards s ON f.family_id = s.family_id
                WHERE standards_fts MATCH ?
                ORDER BY bm25_rank ASC
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

        # 1. Tier 1: Try adjacent keyphrases if 2+ keywords
        if len(keywords) >= 2:
            phrase = f'"{keywords[0]} {keywords[1]}"'
            execute_fts(phrase, max_rows=15)
            # If 3+ keywords, try 2nd pair (e.g. "led panel" or "recessed luminaires")
            if len(keywords) >= 4:
                phrase2 = f'"{keywords[2]} {keywords[3]}"'
                execute_fts(phrase2, max_rows=15)

        # 2. Tier 2: Strict boolean AND of top 3-4 keywords
        if len(keywords) >= 2:
            and_query = " AND ".join(keywords[:4])
            execute_fts(and_query, max_rows=25)

        # 3. Tier 3: Disjunctive Title-Weighted BM25 ranking across all substantive keywords (up to 15)
        or_query = " OR ".join(keywords[:15])
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

    def _load_vector_index(self):
        if not hasattr(self, "_vector_index_loaded"):
            index_path = os.path.join(DATA_DIR, "standards_vector_index.npz")
            if os.path.exists(index_path):
                try:
                    data = np.load(index_path, allow_pickle=True)
                    self._vector_fids = list(data["family_ids"])
                    self._vector_matrix = data["vectors"]  # shape: (N, 384)
                    self._vector_index_loaded = True
                except Exception:
                    self._vector_index_loaded = False
            else:
                self._vector_index_loaded = False

    def search_global_semantic(self, query_text: str, top_k: int = 25) -> List[Dict[str, Any]]:
        """Path C1: True Global Dense Vector Retrieval across pre-computed standards vector index."""
        self._load_vector_index()
        if not getattr(self, "_vector_index_loaded", False) or len(self._vector_fids) == 0:
            return []

        try:
            query_vec = self._get_embedding(query_text)
            # Dot product against all pre-indexed standards in matrix (~1ms)
            sims = np.dot(self._vector_matrix, query_vec)
            # Get top indices
            k = min(top_k, len(self._vector_fids))
            top_indices = np.argpartition(sims, -k)[-k:]
            sorted_indices = top_indices[np.argsort(-sims[top_indices])]

            results = []
            conn = self.get_db_connection()
            cur = conn.cursor()
            for idx in sorted_indices:
                sim = float(sims[idx])
                if sim < 0.28:
                    continue
                fid = self._vector_fids[idx]
                cur.execute("""
                SELECT family_id, prefix, number, part, section, title_en, status, division, year, scope_text, raw_id,
                       product_type, domain, material, application, standard_type, is_test_standard, related_products
                FROM standards
                WHERE family_id = ?;
                """, (fid,))
                row = cur.fetchone()
                if row:
                    item = dict(row)
                    item["semantic_score"] = round(sim, 4)
                    item["channel"] = "GLOBAL_VECTOR"
                    results.append(item)
            conn.close()
            return results
        except Exception:
            return []

    def search_semantic(self, query_text: str, candidate_pool: List[Dict[str, Any]], top_k: int = 15) -> List[Dict[str, Any]]:
        """Path C2: Dense Semantic Rescoring over Candidates incorporating Title, Scope, and Division."""
        if not candidate_pool:
            return []

        self._load_vector_index()
        pool_to_score = candidate_pool[:12]
        query_vec = self._get_embedding(query_text)

        fid_to_vec = {}
        if getattr(self, "_vector_index_loaded", False) and hasattr(self, "_vector_fids"):
            fid_to_vec = {fid: self._vector_matrix[i] for i, fid in enumerate(self._vector_fids)}

        scored_candidates = []
        for cand in pool_to_score:
            fid = cand.get('family_id')
            if fid in fid_to_vec:
                cvec = fid_to_vec[fid]
            else:
                title = cand.get('title_en', '')
                scope = cand.get('scope_text') or ''
                div = cand.get('division') or ''
                scope_str = f" Scope: {scope}" if scope and len(scope) > 5 else ""
                div_str = f" Division: {div}" if div else ""
                doc_repr = f"{title}.{scope_str}{div_str}".strip()
                cvec = self._get_embedding(doc_repr)

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

        # 3. Global Vector Retrieval Channel (True dense semantic search across entire catalogue)
        global_vector_candidates = self.search_global_semantic(query_obj["search_text"], top_k=25)

        # 4. Dense semantic candidate pool (Local rescorer over candidates)
        pool = {c["family_id"]: c for c in (exact_candidates + lexical_candidates + global_vector_candidates)}.values()
        semantic_limit = 6 if exact_candidates else 15
        semantic_candidates = self.search_semantic(query_obj["search_text"], list(pool), top_k=semantic_limit)

        # 5. RRF Fusion: (Exact = 3.5, Global Vector = 1.8, Semantic Rescore = 1.5, Lexical = 1.2)
        fused = self.rrf_fusion(
            [exact_candidates, global_vector_candidates, semantic_candidates, lexical_candidates],
            k=60,
            weights=[3.5, 1.8, 1.5, 1.2]
        )

        return fused[:top_n]

