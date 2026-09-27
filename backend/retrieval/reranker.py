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
import numpy as np
from typing import List, Dict, Any, Optional

class LateInteractionReranker:
    def __init__(self):
        self._colbert_model = None

    @property
    def colbert(self):
        if self._colbert_model is None:
            try:
                from fastembed import LateInteractionTextEmbedding
                self._colbert_model = LateInteractionTextEmbedding("answerdotai/answerai-colbert-small-v1")
            except Exception:
                self._colbert_model = False
        return self._colbert_model if self._colbert_model is not False else None

    def compute_neural_maxsim(self, query_text: str, candidate_texts: List[str]) -> Optional[List[float]]:
        """Action 1: Neural ColBERT Late-Interaction token MaxSim matrix."""
        colbert = self.colbert
        if not colbert or not candidate_texts:
            return None
        try:
            q_emb = list(colbert.embed([query_text]))[0]  # shape: (n_q, dim)
            d_embs = list(colbert.embed(candidate_texts))
            scores = []
            for d_emb in d_embs:
                sim_matrix = np.dot(q_emb, d_emb.T)  # (n_q, n_d)
                max_sims = np.max(sim_matrix, axis=1)  # (n_q,)
                scores.append(float(np.mean(max_sims)))
            return scores
        except Exception:
            return None

    def _tokenize(self, text: str) -> List[str]:
        """Normalize and tokenize text into informative tokens."""
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        tokens = [t for t in clean.split() if len(t) > 1]
        # Filter standard stop words
        stop_words = {
            "the", "and", "for", "with", "all", "shall", "under", "per", "from", "into", "than", "other",
            "to", "in", "of", "be", "by", "at", "on", "an", "is", "it", "as", "or", "if", "do", "we", "re",
            "cost", "costs", "manner", "wise", "year", "years", "rate", "rates", "item", "items", "nos"
        }
        return [t for t in tokens if t not in stop_words]

    def _tokenize_title(self, text: str) -> List[str]:
        """Extract substantive content tokens from standard titles, removing standard catalog boilerplate."""
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        stop_title = {
            "a", "an", "the", "and", "or", "of", "for", "with", "in", "on", "at", "by", "from", "to",
            "part", "section", "sec", "particular", "requirements", "specification", "specifications",
            "general", "methods", "method", "code", "practice", "guidelines", "guide", "sampling"
        }
        return [t for t in clean.split() if len(t) > 2 and t not in stop_title and not t.isdigit()]

    def compute_title_coverage(self, query_tokens: List[str], title_tokens: List[str]) -> float:
        """
        Evaluates what fraction of the standard's substantive title is satisfied by the tender query.
        Invariant to tender clause length: a 30-word tender will not dilute a 3-word title!
        """
        if not title_tokens or not query_tokens:
            return 0.0
        q_set = set(query_tokens)
        matches = 0.0
        for t_tok in title_tokens:
            if t_tok in q_set:
                matches += 1.0
            elif len(t_tok) >= 4 and any(t_tok in qt or qt in t_tok for qt in q_set if len(qt) >= 4):
                matches += 0.75
            elif len(t_tok) >= 5:
                prefix = t_tok[:4]
                if any(qt.startswith(prefix) for qt in q_set if len(qt) >= 4):
                    matches += 0.50
        return min(1.0, matches / len(title_tokens))

    def compute_maxsim(self, query_tokens: List[str], doc_tokens: List[str]) -> float:
        """
        Emulates ColBERT MaxSim: for each query token, finds maximum similarity
        against doc tokens, normalized across substantive query tokens.
        """
        if not query_tokens or not doc_tokens:
            return 0.0

        doc_set = set(doc_tokens)
        sim_sum = 0.0
        for q_tok in query_tokens:
            if q_tok in doc_set:
                sim_sum += 1.0
            elif len(q_tok) >= 4 and any(q_tok in dt or dt in q_tok for dt in doc_set if len(dt) >= 4):
                sim_sum += 0.75
            else:
                q_len = len(q_tok)
                if q_len >= 5:
                    prefix = q_tok[:4]
                    if any(dt.startswith(prefix) for dt in doc_set if len(dt) >= 4):
                        sim_sum += 0.5

        return sim_sum / len(query_tokens)

    def compute_query_coverage_in_title(self, query_tokens: List[str], title_tokens: List[str]) -> float:
        """Evaluates what fraction of substantive query tokens appear in the standard title."""
        if not query_tokens or not title_tokens:
            return 0.0
        t_set = set(title_tokens)
        matches = 0.0
        for q_tok in query_tokens:
            if q_tok in t_set:
                matches += 1.0
            elif len(q_tok) >= 4 and any(q_tok in tt or tt in q_tok for tt in t_set if len(tt) >= 4):
                matches += 0.75
        return min(1.0, matches / len(query_tokens))

    def rerank(self, query_text: str, candidates: List[Dict[str, Any]], top_k: int = 15) -> List[Dict[str, Any]]:
        """
        Asymmetric Dual-Coverage Reranking:
        1. Title Coverage & Query Recall in Title (45% weight)
        2. Scope & Spec MaxSim: Parameter and environment alignment (20% weight)
        3. Reciprocal Rank Fusion prior (35% weight)
        4. Standard status priority (CURRENT > REAFFIRMED > SUPERSEDED)
        5. Physical artifact form consistency (e.g. pipe vs sheet vs fitting)
        """
        if not candidates:
            return []

        query_tokens = self._tokenize(query_text)
        query_lower = query_text.lower().strip()

        # Compute ColBERT neural MaxSim for top candidates if available
        cand_texts = [f"{c.get('title_en', '')} {c.get('scope_text', '')}".strip() for c in candidates[:15]]
        neural_scores = self.compute_neural_maxsim(query_text, cand_texts)

        reranked = []
        for cand_idx, cand in enumerate(candidates):
            title = (cand.get("title_en") or "").lower()
            scope = (cand.get("scope_text") or "").lower()
            title_tokens = self._tokenize_title(title)
            doc_tokens = self._tokenize(f"{title} {scope}")

            # 1. Asymmetric Title Coverage (Direct Product Match)
            title_coverage = self.compute_title_coverage(query_tokens, title_tokens)
            query_coverage_in_title = self.compute_query_coverage_in_title(query_tokens, title_tokens)
            balanced_title_alignment = (0.40 * title_coverage) + (0.60 * query_coverage_in_title)

            # If ColBERT neural MaxSim is available, blend it in (50% token coverage + 50% neural MaxSim)
            if neural_scores and cand_idx < len(neural_scores):
                neural_alignment = max(0.0, min(1.0, neural_scores[cand_idx]))
                combined_alignment = (0.50 * balanced_title_alignment) + (0.50 * neural_alignment)
            else:
                combined_alignment = balanced_title_alignment

            # 2. Scope MaxSim for secondary parameters
            scope_maxsim = self.compute_maxsim(query_tokens, doc_tokens)

            # 3. Multi-word technical n-gram phrase bonus (e.g. "soil and waste discharge", "recessed luminaires", "submersible pump")
            phrase_bonus = 0.0
            clean_q_words = re.sub(r'[^a-zA-Z0-9\s]', ' ', query_lower).split()
            # Check 3-grams
            for i in range(len(clean_q_words) - 2):
                tri = f"{clean_q_words[i]} {clean_q_words[i+1]} {clean_q_words[i+2]}"
                if len(tri) >= 9 and tri in title:
                    phrase_bonus = max(phrase_bonus, 0.35)
            # Check 2-grams
            if phrase_bonus == 0.0:
                for i in range(len(clean_q_words) - 1):
                    bi = f"{clean_q_words[i]} {clean_q_words[i+1]}"
                    if len(bi) >= 7 and bi in title:
                        phrase_bonus = max(phrase_bonus, 0.20)
            if phrase_bonus == 0.0 and any(len(t) > 3 and t in title for t in query_tokens):
                phrase_bonus = 0.08

            # Substantive domain application keyword overlap bonus (e.g. soil, waste, ventilation, drainage, drinking)
            domain_stopwords = {"upvc", "pvc", "pipe", "pipes", "polyvinyl", "chloride", "steel", "iron", "aluminium", "plastic", "tubes", "supply", "installation"}
            domain_overlap = len(set(query_tokens) & set(title_tokens) - domain_stopwords)
            if domain_overlap >= 3:
                phrase_bonus += 0.28
            elif domain_overlap >= 2:
                phrase_bonus += 0.16

            # 4. Status validity prior
            status = cand.get("status", "CURRENT")
            status_weight = 1.0
            if status == "SUPERSEDED":
                status_weight = 0.75
            elif status == "WITHDRAWN":
                status_weight = 0.40

            # 5. Document Role & Scope Prior
            role_adjustment = 0.0
            is_testing_query = any(w in query_lower for w in [
                "test method", "methods of test", "testing", "code of safety", "code of practice", 
                "sampling", "earthing", "bonding", "grounding", "wiring", "installation", "vocabulary", "definitions"
            ])
            is_auxiliary_doc = any(phrase in title for phrase in [
                "method of test", "methods of test", "code of safety", "code of practice", 
                "method for evaluation", "methods of sampling", "guidelines for", "guide for"
            ]) or cand.get("is_test_standard") == 1 or cand.get("standard_type") in ["Test Standard", "Code of Practice"]
            
            if is_auxiliary_doc and not is_testing_query:
                role_adjustment -= 0.40
            elif "specification" in title and not is_testing_query:
                role_adjustment += 0.12

            # Curated Lexicon Channel Priority Bonus
            if cand.get("source_channel") == "TRADE_LEXICON":
                phrase_bonus += 0.50
            elif cand.get("source_channel") == "EXACT_ID":
                phrase_bonus += 0.60

            # Product match bonus
            cand_p = (cand.get("product_type") or "").lower()
            if cand_p and any(cand_p in q_word or q_word in cand_p for q_word in ["steel tube", "steel pipe", "upvc pipe", "rebar", "brick", "cable", "motor", "pump"]):
                phrase_bonus += 0.20

            # Zero-Title Penalty: If standard's title shares zero substantive tokens with query
            if title_tokens and title_coverage == 0.0:
                role_adjustment -= 0.45

            # 6. Physical Artifact Form Consistency Check
            # Ensure primary artifact form alignment (e.g. pipe vs fitting vs sheet, luminaire vs electrical panel)
            q_words = set(re.sub(r'[^a-zA-Z0-9\s]', ' ', query_lower).split())
            t_words = set(re.sub(r'[^a-zA-Z0-9\s]', ' ', title).split())
            if any(w in q_words for w in ["pipe", "pipes", "piping", "tube", "tubes", "tubular"]):
                is_feedstock = any(w in t_words for w in ["sheet", "sheets", "plate", "plates", "strip", "strips", "coil", "coils", "billet", "ingot"]) and not any(w in q_words for w in ["sheet", "sheets", "plate", "plates", "strip", "strips", "coil", "coils", "billet", "ingot"])
                is_coating_std = any(w in t_words for w in ["coating", "coatings", "lining", "linings"]) and not any(w in q_words for w in ["coating", "coatings", "lining"])
                is_fitting_std = any(w in t_words for w in ["fitting", "fittings"]) and not any(w in q_words for w in ["fitting", "fittings"]) and ("part 2" in title or "part 3" in title or "fittings" in title.split("part")[-1] or not any(w in t_words for w in ["pipe", "pipes", "tube", "tubes"]))

                if is_feedstock:
                    role_adjustment -= 0.65
                elif is_coating_std:
                    role_adjustment -= 0.50
                elif is_fitting_std:
                    role_adjustment -= 0.40
                elif any(w in t_words for w in ["pipe", "pipes", "tube", "tubes", "tubular"]):
                    role_adjustment += 0.35

                if any(w in title for w in ["sub-zero", "sub zero", "cryogenic", "refrigeration"]) and not any(w in query_lower for w in ["sub-zero", "sub zero", "cryogenic", "refrigeration", "low temperature"]):
                    role_adjustment -= 0.50

            elif any(w in q_words for w in ["sheet", "sheets"]):
                if any(w in t_words for w in ["sheet", "sheets"]):
                    role_adjustment += 0.20
                if any(w in t_words for w in ["pipe", "pipes", "tube", "tubes"]):
                    role_adjustment -= 0.40
            elif any(w in q_words for w in ["luminaire", "luminaires", "lighting", "illumination"]):
                if any(w in t_words for w in ["luminaire", "luminaires"]):
                    role_adjustment += 0.25
                if any(w in t_words for w in ["screw", "screws", "press", "presses", "socket", "wrench", "fuses"]):
                    role_adjustment -= 0.45
                elif any(w in t_words for w in ["panel", "panels"]) and not any(w in t_words for w in ["luminaire", "luminaires", "lighting"]):
                    # Query asked for luminaire, candidate is an electrical switchgear/distribution panel
                    role_adjustment -= 0.40
            elif any(w in q_words for w in ["conduit", "conduits"]):
                if any(w in t_words for w in ["fitting", "fittings"]) and not any(w in q_words for w in ["fitting", "fittings"]):
                    role_adjustment -= 0.35
                elif any(w in t_words for w in ["conduit", "conduits"]):
                    role_adjustment += 0.25
            elif any(w in q_words for w in ["assembly", "assemblies", "distribution board"]):
                if any(w in t_words for w in ["assembly", "assemblies"]):
                    role_adjustment += 0.35

            # 7. Material & Environmental Contradiction Checks
            if "carbon steel" in query_lower and "stainless steel" in title:
                role_adjustment -= 0.35
            elif "stainless steel" in query_lower and "carbon steel" in title:
                role_adjustment -= 0.35
            elif "pvc" in query_lower and any(ins in title for ins in ["thermosetting", "cross-linked", "xlpe"]) and "pvc" not in title:
                role_adjustment -= 0.35
            elif any(ins in query_lower for ins in ["thermosetting", "cross-linked", "xlpe"]) and "pvc" in title and "xlpe" not in title:
                role_adjustment -= 0.35

            # 7b. Functional Application Consistency Checks
            if any(w in query_lower for w in ["soil", "waste", "drainage", "sewerage"]):
                if any(w in title for w in ["water supply", "potable water", "drinking water"]) and not any(w in title for w in ["soil", "waste", "drainage", "sewerage"]):
                    role_adjustment -= 0.35
            elif any(w in query_lower for w in ["potable water", "drinking water"]):
                if any(w in title for w in ["sewerage", "drainage", "soil and waste"]):
                    role_adjustment -= 0.35

            if any(w in query_lower for w in ["indoor", "internal illumination", "recessed"]):
                if any(w in title for w in ["road and street", "street lighting", "flood light", "floodlight"]):
                    role_adjustment -= 0.35
            elif any(w in query_lower for w in ["street lighting", "road and street"]):
                if any(w in title for w in ["recessed", "portable general", "hospitals"]):
                    role_adjustment -= 0.35

            # 8. Negative Constraint Handling ("other than X")
            if "other than" in query_lower:
                neg_match = re.search(r'other than\s+([^,;\n]+)', query_lower)
                if neg_match:
                    neg_phrase = neg_match.group(1).strip()
                    if neg_phrase in title and "other than" not in title:
                        role_adjustment -= 0.45

            # 9. Domain Cross-Contamination Guard
            is_civil_query = any(w in query_lower for w in [
                "concrete", "cement", "mortar", "plaster", "excavation", "rebar", "masonry", 
                "brick", "foundation", "rcc", "soling", "tile", "tiles", "aggregate", "sand", "murum"
            ])
            cand_div = cand.get("division") or ""
            if is_civil_query:
                if cand_div in ["Food and Agriculture", "Textiles"]:
                    role_adjustment -= 0.65
                elif any(irrel in title for irrel in ["dosa", "food", "edible", "dyestuff", "textile", "fabric", "cloth", "garment", "oil cans"]):
                    role_adjustment -= 0.65

            # 10. Hybrid RRF prior (from stage 1)
            rrf_prior = cand.get("rrf_score", 0.05) * 5.0  # scale to ~0.1 - 0.7

            # 11. Provenance bonus (exact ID match or verified trade mapping)
            channel_bonus = 0.35 if cand.get("source_channel") in ["EXACT_ID", "TRADE_LEXICON"] else 0.0

            # Combined Asymmetric Dual-Coverage Score
            final_relevance = (combined_alignment * 0.45 + scope_maxsim * 0.20 + rrf_prior * 0.35 + phrase_bonus + channel_bonus + role_adjustment) * status_weight
            
            item = dict(cand)
            item["late_interaction_score"] = round(final_relevance, 4)
            item["title_coverage"] = round(title_coverage, 4)
            item["maxsim_score"] = round(scope_maxsim, 4)
            if neural_scores and cand_idx < len(neural_scores):
                item["colbert_maxsim"] = round(float(neural_scores[cand_idx]), 4)
            reranked.append(item)

        # Sort descending by fine-grained score
        reranked.sort(key=lambda x: x["late_interaction_score"], reverse=True)
        return reranked[:top_k]
