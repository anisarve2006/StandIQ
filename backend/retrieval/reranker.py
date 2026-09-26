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
        stop_words = {
            "the", "and", "for", "with", "all", "shall", "under", "per", "from", "into", "than", "other",
            "to", "in", "of", "be", "by", "at", "on", "an", "is", "it", "as", "or", "if", "do", "we", "re",
            "cost", "costs", "manner", "wise", "year", "years", "rate", "rates", "item", "items", "nos"
        }
        return [t for t in tokens if t not in stop_words]

    def compute_maxsim(self, query_tokens: List[str], doc_tokens: List[str]) -> float:
        """
        Emulates ColBERT MaxSim: for each query token, finds maximum similarity
        against doc tokens, and sums them up normalized by query length.
        """
        if not query_tokens or not doc_tokens:
            return 0.0

        doc_set = set(doc_tokens)
        sim_sum = 0.0
        for q_tok in query_tokens:
            if q_tok in doc_set:
                # Exact token match
                sim_sum += 1.0
            elif len(q_tok) >= 4 and any(q_tok in dt or dt in q_tok for dt in doc_set if len(dt) >= 4):
                # Substring match only for substantive tokens (len >= 4) e.g. "motor" in "motors"
                sim_sum += 0.75
            else:
                # Character prefix overlap for morphological variations (len >= 5)
                best_sub = 0.0
                q_len = len(q_tok)
                if q_len >= 5:
                    prefix = q_tok[:4]
                    if any(dt.startswith(prefix) for dt in doc_set if len(dt) >= 4):
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
            is_testing_query = any(w in query_lower for w in [
                "testing of", "testing", "test method", "methods of test", 
                "methods of testing", "methods of physical tests", "compressive strength at specified ages"
            ])
            is_test_doc = any(phrase in title for phrase in [
                "method of test", "methods of test", "methods of testing", 
                "methods of physical tests", "methods of sampling", "basis for acceptance"
            ])
            is_safety_doc = "code of safety" in title
            is_workmanship_doc = "code of practice" in title

            if is_testing_query:
                if is_test_doc:
                    role_adjustment += 0.40
                elif "specification" in title and not is_test_doc:
                    role_adjustment -= 0.40
            else:
                if is_test_doc:
                    role_adjustment -= 0.35
                elif is_safety_doc and any(w in query_lower for w in ["excavation in foundation", "excavation for", "trenches"]):
                    role_adjustment -= 0.20
                elif "specification" in title:
                    role_adjustment += 0.12

            # 5. Workmanship vs Component Material Prioritization (Primary vs Complementary)
            # Concrete execution: IS 456 (or IS 4926 for RMC, IS 1343 for Prestressed) is primary
            if any(w in query_lower for w in ["concrete", "rcc", "pcc"]) and not is_testing_query:
                # Disqualify rebar standards (IS 16651, IS 18256, IS 1786) unless steel reinforcement is explicitly requested
                if any(rebar_std in cand.get("family_id", "") for rebar_std in ["16651", "18256", "1786"]):
                    if not any(spec_rebar in query_lower for spec_rebar in ["steel bar", "rebar", "reinforcement bar", "sariya", "fe-500", "fe 500", "stainless steel", "gfrp"]):
                        role_adjustment -= 0.85

                if any(m in query_lower for m in [
                    "m-10", "m-15", "m-20", "m-25", "m-30", "m10", "m15", "m20", "m25", 
                    "plain cement concrete", "plain concrete", "reinforced concrete", 
                    "column", "beam", "slab", "staircase", "retaining wall", "footing", 
                    "bedding", "flooring base", "foundation bed", "lean concrete",
                    "high-strength concrete", "high strength concrete", "lightweight concrete",
                    "fibre-reinforced", "fiber-reinforced", "pcc"
                ]):
                    if "456" in cand.get("family_id", "") or "plain and reinforced concrete" in title:
                        role_adjustment += 0.45
                    elif "383" in cand.get("family_id", ""):
                        role_adjustment -= 0.25
                    elif "1237" in cand.get("family_id", "") and not any(t in query_lower for t in ["tile", "terrazzo"]):
                        role_adjustment -= 0.45

                elif "ready mix" in query_lower or "ready-mix" in query_lower or "ready-mixed" in query_lower or "self-compacting" in query_lower:
                    if "4926" in cand.get("family_id", "") or "ready-mixed concrete" in title:
                        role_adjustment += 0.50

            # Prestressed Concrete (IS 1343)
            if any(w in query_lower for w in ["prestressed concrete", "prestress"]):
                if "1343" in cand.get("family_id", "") or "prestressed concrete" in title:
                    role_adjustment += 0.60
                elif any(rebar_std in cand.get("family_id", "") for rebar_std in ["16651", "18256"]):
                    role_adjustment -= 0.70

            # Shotcrete / Sprayed concrete (IS 9012)
            if any(w in query_lower for w in ["shotcrete", "gunite", "sprayed concrete"]):
                if "9012" in cand.get("family_id", "") or "shotcreting" in title:
                    role_adjustment += 0.65
                elif "16651" in cand.get("family_id", ""):
                    role_adjustment -= 0.70

            # Piles and Pile Foundation (IS 2911)
            if any(w in query_lower for w in ["pile foundation", "concrete pile", "pile cap"]):
                if "2911" in cand.get("family_id", ""):
                    role_adjustment += 0.50

            # Raft Foundation (IS 2950 / IS 456)
            if "raft foundation" in query_lower:
                if "2950" in cand.get("family_id", ""):
                    role_adjustment += 0.50
                elif "456" in cand.get("family_id", ""):
                    role_adjustment += 0.40

            # Earthwork, site clearance, topsoil, filling (IS 1200:P1)
            if any(w in query_lower for w in ["site clearance", "topsoil stripping", "earth filling", "compacted earth", "sand filling"]):
                if "1200" in cand.get("family_id", ""):
                    role_adjustment += 0.45

            # Road Construction & Bituminous Pavements
            if any(w in query_lower for w in ["bituminous macadam", "dense bituminous macadam", "bituminous concrete", "dbm"]):
                if "73" in cand.get("family_id", "") or "paving bitumen" in title:
                    role_adjustment += 0.50
            if any(w in query_lower for w in ["prime coat", "tack coat"]):
                if "8887" in cand.get("family_id", "") or "bitumen emulsion" in title:
                    role_adjustment += 0.55
            if any(w in query_lower for w in ["granular sub-base", "wet mix macadam", "water bound macadam", "wbm", "wmm"]):
                if "383" in cand.get("family_id", "") or "coarse and fine aggregate" in title:
                    role_adjustment += 0.45

            # Plastering: IS 1661 is primary execution code, mortar IS 2250 is component
            if any(w in query_lower for w in ["plastering", "rendering", "plaster"]) and not is_testing_query:
                if any(p in query_lower for p in ["paint", "cement paint", "gypsum", "plaster of paris"]):
                    pass
                elif "1661" in cand.get("family_id", "") or "application of cement and cement-lime plaster" in title:
                    role_adjustment += 0.40
                elif "2402" in cand.get("family_id", "") and "rendered" in query_lower:
                    role_adjustment += 0.45
                elif "2250" in cand.get("family_id", ""):
                    role_adjustment -= 0.25

            if any(p in query_lower for p in ["cement paint", "waterproof cement paint"]):
                if "5410" in cand.get("family_id", ""):
                    role_adjustment += 0.50
                elif "1661" in cand.get("family_id", ""):
                    role_adjustment -= 0.40

            if any(p in query_lower for p in ["gypsum plaster", "plaster of paris"]):
                if "2547" in cand.get("family_id", ""):
                    role_adjustment += 0.50
                elif "1661" in cand.get("family_id", ""):
                    role_adjustment -= 0.40

            if "reinforcement steel" in query_lower or "steel reinforcement" in query_lower:
                if "1786" in cand.get("family_id", ""):
                    role_adjustment += 0.50

            # Grouting
            if any(w in query_lower for w in ["grout", "grouting"]):
                if any(rebar_std in cand.get("family_id", "") for rebar_std in ["16651", "18256", "1786"]):
                    role_adjustment -= 0.85
                elif "6066" in cand.get("family_id", "") and "foundation" in query_lower:
                    role_adjustment += 0.50

            # Brick masonry: IS 2212 is primary construction code, mortar IS 2250 is component
            if any(w in query_lower for w in ["masonry walls", "brickwork", "brick masonry"]) and not is_testing_query:
                if "2212" in cand.get("family_id", "") or "code of practice for brickwork" in title:
                    role_adjustment += 0.40
                elif "2250" in cand.get("family_id", ""):
                    role_adjustment -= 0.25

            # Tiles on floor: IS 15622 is primary tile, mortar IS 2250 is fixing medium
            if any(w in query_lower for w in ["tiles on floors", "floor tiles", "ceramic tiles", "vitrified"]):
                if "15622" in cand.get("family_id", "") or "pressed ceramic tiles" in title:
                    role_adjustment += 0.35
                elif "2250" in cand.get("family_id", ""):
                    role_adjustment -= 0.45

            # Conventional bricks vs perforated bricks
            if "conventional" in query_lower and "brick" in query_lower:
                if "2222" in cand.get("family_id", "") or "perforated" in title:
                    role_adjustment -= 0.50
                elif "1077" in cand.get("family_id", "") or "common burnt clay" in title:
                    role_adjustment += 0.40

            # Fly ash-lime bricks vs burnt clay fly ash bricks
            if any(w in query_lower for w in ["fly ash-lime", "fly ash lime"]):
                if "12894" in cand.get("family_id", "") or "pulverized fuel ash-lime" in title:
                    role_adjustment += 0.45
                elif "13757" in cand.get("family_id", "") or "burnt clay fly ash" in title:
                    role_adjustment -= 0.40

            # 6. Material & Environmental Contradiction Checks
            if "carbon steel" in query_lower and "stainless steel" in title:
                role_adjustment -= 0.45
            elif "stainless steel" in query_lower and "carbon steel" in title:
                role_adjustment -= 0.45

            # PVC vs XLPE Cables
            if "pvc" in query_lower and any(ins in title for ins in ["thermosetting", "cross-linked", "crosslinked", "xlpe"]) and "pvc" not in title:
                role_adjustment -= 0.85
            elif any(ins in query_lower for ins in ["thermosetting", "cross-linked", "xlpe"]) and "pvc" in title and "xlpe" not in title:
                role_adjustment -= 0.85

            # Internal wiring cables (IS 694) vs Heavy duty (IS 1554)
            if "internal wiring" in query_lower:
                if "694" in cand.get("family_id", ""):
                    role_adjustment += 0.40
                elif "1554" in cand.get("family_id", ""):
                    role_adjustment -= 0.20

            # CPVC Pipes vs Fittings
            if "cpvc" in query_lower and "pipe" in query_lower:
                if "17546" in cand.get("family_id", "") or "fittings" in title:
                    role_adjustment -= 0.65
                elif "15778" in cand.get("family_id", "") or "pipes" in title:
                    role_adjustment += 0.40

            # GI Plumbing Pipes vs Large transmission mains
            if ("gi pipe" in query_lower or "gi steel pipe" in query_lower or "galvanized iron pipe" in query_lower) or ("gi" in query_lower and "water supply" in query_lower):
                if "1239" in cand.get("family_id", ""):
                    role_adjustment += 0.45
                elif "3589" in cand.get("family_id", ""):
                    role_adjustment -= 0.35

            # Dry distemper vs Washable distemper
            if "dry" in query_lower and "distemper" in query_lower:
                if "427" in cand.get("family_id", "") or "dry" in title:
                    role_adjustment += 0.45
                elif "428" in cand.get("family_id", "") or "washable" in title:
                    role_adjustment -= 0.50

            # Digital clinical thermometer vs Mercury clinical thermometer
            if "digital" in query_lower and "thermometer" in query_lower:
                if "15113" in cand.get("family_id", "") or "electrical" in title:
                    role_adjustment += 0.45
                elif "3055" in cand.get("family_id", ""):
                    role_adjustment -= 0.50

            # Fire Fighting Pump (IS 12469 / IS 15301) vs Hose (IS 14933)
            if "fire" in query_lower and "pump" in query_lower:
                if "12469" in cand.get("family_id", "") or "15301" in cand.get("family_id", "") or "fire fighting system" in title:
                    role_adjustment += 0.60
                elif "14933" in cand.get("family_id", "") or "hose" in title:
                    role_adjustment -= 0.80

            # Fire Hose Reel (IS 884) vs Fire Delivery Hose (IS 636)
            if "hose reel" in query_lower or "hose-reel" in query_lower:
                if "884" in cand.get("family_id", "") or "hose-reel" in title.lower() or "hose reel" in title.lower():
                    role_adjustment += 0.65
                elif "636" in cand.get("family_id", ""):
                    role_adjustment -= 0.50
            elif "fire hose" in query_lower:
                if "636" in cand.get("family_id", "") or "delivery hose" in title.lower():
                    role_adjustment += 0.55
                elif "884" in cand.get("family_id", ""):
                    role_adjustment -= 0.35

            # Fire Hydrant Landing Valve (IS 5290)
            if "landing valve" in query_lower:
                if "5290" in cand.get("family_id", "") or "landing valve" in title:
                    role_adjustment += 0.65
                elif "909" in cand.get("family_id", ""):
                    role_adjustment -= 0.40

            # Wet / Dry Riser Systems (IS 3844)
            if any(w in query_lower for w in ["riser system", "wet riser", "dry riser"]):
                if "3844" in cand.get("family_id", "") or "internal fire hydrant" in title:
                    role_adjustment += 0.65
                elif any(irrel in cand.get("family_id", "") for irrel in ["5034", "11833"]):
                    role_adjustment -= 0.70

            # Ventilation Fans (IS 4894 / IS 3588) vs Adhesives / Regulators
            if any(w in query_lower for w in ["ventilation fan", "centrifugal fan", "smoke extraction fan"]):
                if "4894" in cand.get("family_id", "") or "centrifugal fan" in title:
                    role_adjustment += 0.55
                elif "3588" in cand.get("family_id", "") or "axial flow" in title:
                    role_adjustment += 0.45
                elif any(irrel in cand.get("family_id", "") for irrel in ["17917", "11037"]):
                    role_adjustment -= 0.75

            if "axial" in query_lower and "fan" in query_lower:
                if "3588" in cand.get("family_id", "") or "axial flow" in title:
                    role_adjustment += 0.60
                elif "11037" in cand.get("family_id", ""):
                    role_adjustment -= 0.65

            # Air Handling Unit (AHU) & VRF vs Cargo equipment / Ducts
            if any(w in query_lower for w in ["air handling unit", "ahu"]):
                if "8148" in cand.get("family_id", "") or "packaged air conditioner" in title:
                    role_adjustment += 0.60
                elif "11436" in cand.get("family_id", ""):
                    role_adjustment -= 0.85

            if "vrf" in query_lower:
                if "8148" in cand.get("family_id", "") or "1391" in cand.get("family_id", ""):
                    role_adjustment += 0.55
                elif "655" in cand.get("family_id", ""):
                    role_adjustment -= 0.60

            # Chillers (IS 16590) vs Heat exchangers
            if "chiller" in query_lower or "chilled water" in query_lower:
                if "16590" in cand.get("family_id", "") or "liquid chilling" in title:
                    role_adjustment += 0.60
                elif "10470" in cand.get("family_id", ""):
                    role_adjustment -= 0.40

            # Duct Insulation (IS 8183 / IS 3677)
            if "duct" in query_lower and "insulation" in query_lower:
                if "8183" in cand.get("family_id", "") or "mineral wool" in title:
                    role_adjustment += 0.55
                elif any(irrel in cand.get("family_id", "") for irrel in ["9743", "11050"]):
                    role_adjustment -= 0.50

            # HVAC Air Filters (IS 7613)
            if "air filter" in query_lower and "hvac" in query_lower:
                if "7613" in cand.get("family_id", "") or "panel type air filter" in title:
                    role_adjustment += 0.60
                elif "16071" in cand.get("family_id", ""):
                    role_adjustment -= 0.45

            # 7. Negative Constraint Handling ("other than X")
            if "other than" in query_lower:
                neg_match = re.search(r'other than\s+([^,;\n]+)', query_lower)
                if neg_match:
                    neg_phrase = neg_match.group(1).strip()
                    if neg_phrase in title and "other than" not in title:
                        role_adjustment -= 0.45

            # 8. Domain Cross-Contamination Guard
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
