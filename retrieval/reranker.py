"""
Late-Interaction Token Reranker (ColBERT-style MaxSim & Multi-Factor Scoring).
Layer 15 from Architecture Specification & PDF Section 15.

Applies fine-grained token-level late-interaction matching (MaxSim)
over the top candidate pool (top 30-50 candidates) combined with
domain priors and technical token alignment.
Runs ultra-fast on CPU (<35ms).
"""

import math
import re
from typing import List, Dict, Any, Optional

class LateInteractionReranker:
    def __init__(self):
        pass

    def _tokenize(self, text: str) -> List[str]:
        """Normalize and tokenize text into informative tokens."""
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        tokens = [t for t in clean.split() if len(t) > 1]
        # Filter standard stop words
        stop_words = {"the", "and", "for", "with", "all", "shall", "under", "per", "from", "into", "than", "other"}
        return [t for t in tokens if t not in stop_words]

    def compute_maxsim(self, query_tokens: List[str], doc_tokens: List[str]) -> float:
        """
        Emulates ColBERT MaxSim: for each query token, finds maximum similarity
        against doc tokens, and sums them up normalized by query length.
        """
        if not query_tokens or not doc_tokens:
            return 0.0

        doc_set = set(doc_tokens)
        doc_text = " ".join(doc_tokens)
        
        sim_sum = 0.0
        for q_tok in query_tokens:
            if q_tok in doc_set:
                # Exact token match
                sim_sum += 1.0
            elif q_tok in doc_text:
                # Substring match (e.g. "motor" in "motors", "reinforce" in "reinforcement")
                sim_sum += 0.75
            else:
                # Character ngram overlap for morphological similarity
                best_sub = 0.0
                q_len = len(q_tok)
                if q_len >= 4:
                    prefix = q_tok[:4]
                    if prefix in doc_text:
                        best_sub = 0.5
                sim_sum += best_sub

        return sim_sum / len(query_tokens)

    def rerank(self, query_text: str, candidates: List[Dict[str, Any]], top_k: int = 15) -> List[Dict[str, Any]]:
        """
        Reranks candidate pool using:
        1. Token-level MaxSim score (0.0 to 1.0)
        2. Exact phrase presence in title/scope
        3. Reciprocal Rank Fusion prior
        4. Standard status priority (CURRENT > REAFFIRMED > SUPERSEDED)
        """
        if not candidates:
            return []

        query_tokens = self._tokenize(query_text)
        query_lower = query_text.lower().strip()

        reranked = []
        for cand in candidates:
            title = (cand.get("title_en") or "").lower()
            scope = (cand.get("scope_text") or "").lower()
            doc_tokens = self._tokenize(f"{title} {scope}")

            # 1. ColBERT-style MaxSim
            maxsim_score = self.compute_maxsim(query_tokens, doc_tokens)

            # 2. Exact phrase bonus (e.g., "submersible pump", "tmt bar")
            phrase_bonus = 0.0
            if len(query_lower) > 4 and query_lower in title:
                phrase_bonus = 0.25
            elif any(t in title for t in query_tokens if len(t) > 3):
                phrase_bonus = 0.10

            # 3. Status validity prior
            status = cand.get("status", "CURRENT")
            status_weight = 1.0
            if status == "SUPERSEDED":
                status_weight = 0.75
            elif status == "WITHDRAWN":
                status_weight = 0.40

            # 4. Document Role & Scope Prior (Product Specification vs Test Method vs Safety Code)
            role_adjustment = 0.0
            is_testing_query = any(w in query_lower for w in ["test method", "methods of test", "testing", "code of safety", "code of practice", "sampling"])
            is_auxiliary_doc = any(phrase in title for phrase in [
                "method of test", "methods of test", "code of safety", "code of practice", 
                "method for evaluation", "methods of sampling", "guidelines for", "guide for"
            ])
            
            if is_auxiliary_doc and not is_testing_query:
                role_adjustment -= 0.25
            elif "specification" in title and not is_testing_query:
                role_adjustment += 0.12

            # 5. Material & Environmental Contradiction Checks
            if "carbon steel" in query_lower and "stainless steel" in title:
                role_adjustment -= 0.35
            elif "stainless steel" in query_lower and "carbon steel" in title:
                role_adjustment -= 0.35
            elif "pvc" in query_lower and any(ins in title for ins in ["thermosetting", "cross-linked", "xlpe"]) and "pvc" not in title:
                role_adjustment -= 0.35
            elif any(ins in query_lower for ins in ["thermosetting", "cross-linked", "xlpe"]) and "pvc" in title and "xlpe" not in title:
                role_adjustment -= 0.35

            # 6. Negative Constraint Handling ("other than X")
            if "other than" in query_lower:
                neg_match = re.search(r'other than\s+([^,;\n]+)', query_lower)
                if neg_match:
                    neg_phrase = neg_match.group(1).strip()
                    # If document title matches the excluded phrase and doesn't contain "other than"
                    if neg_phrase in title and "other than" not in title:
                        role_adjustment -= 0.45

            # 7. Hybrid RRF prior (if present from stage 1)
            rrf_prior = cand.get("rrf_score", 0.05) * 5.0  # scale to ~0.1 - 0.7

            # 8. Provenance bonus (exact ID match or verified trade mapping)
            channel_bonus = 0.35 if cand.get("source_channel") in ["EXACT_ID", "TRADE_LEXICON"] else 0.0

            # Combined late-interaction relevance score
            final_relevance = (maxsim_score * 0.35 + phrase_bonus * 0.20 + rrf_prior * 0.35 + channel_bonus + role_adjustment) * status_weight
            
            item = dict(cand)
            item["late_interaction_score"] = round(final_relevance, 4)
            item["maxsim_score"] = round(maxsim_score, 4)
            reranked.append(item)

        # Sort descending by fine-grained score
        reranked.sort(key=lambda x: x["late_interaction_score"], reverse=True)
        return reranked[:top_k]
