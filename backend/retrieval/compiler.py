"""
Neuro-Symbolic Query Compiler (Layer 10 & 11 from Architecture Specification).
Converts natural language procurement queries into structured technical requirement representations.
Combines deterministic regex/unit extraction with trade-lexicon and optional LLM expansion.
"""

import re
from typing import Dict, Any, List, Optional
from data_pipeline.ids import parse_is_identifier
from retrieval.multilingual import (
    translate_indic_procurement_query,
    CROSS_LINGUAL_LEXICON,
    detect_script,
    mask_technical_entities,
    unmask_technical_entities
)
from retrieval.archetype_classifier import archetype_classifier
from retrieval.product_classifier import product_classifier

from repositories.alias_repository import alias_repository

class _DynamicTradeLexicon(dict):
    """
    Dynamic dictionary view backed by SQLite standard_aliases table.
    Eliminates hardcoded dictionary from Python source code while maintaining
    full backwards compatibility.
    """
    def __getitem__(self, key):
        aliases = alias_repository.get_all_aliases()
        for a in aliases:
            if a["alias_term"] == key.lower():
                return {
                    "product": a["product_name"],
                    "family_id": a["family_id"],
                    "division": a.get("division", "Civil Engineering")
                }
        raise KeyError(key)

    def items(self):
        aliases = alias_repository.get_all_aliases()
        return [
            (a["alias_term"], {
                "product": a["product_name"],
                "family_id": a["family_id"],
                "division": a.get("division", "Civil Engineering")
            })
            for a in aliases
        ]

    def __contains__(self, key):
        return any(a["alias_term"] == key.lower() for a in alias_repository.get_all_aliases())

    def __len__(self):
        return len(alias_repository.get_all_aliases())

# Dynamic database-backed trade lexicon (zero hardcoded dictionaries in code)
TRADE_LEXICON = _DynamicTradeLexicon()


def extract_units_and_numbers(text: str) -> Dict[str, Any]:
    """Deterministic parser: extracts technical constraints and engineering parameters."""
    constraints = {}

    # Voltage (e.g. 415 V, 230V, 11 kV)
    v_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:V|volts?|kV)\b', text, re.IGNORECASE)
    if v_match:
        val = float(v_match.group(1))
        if 'kv' in v_match.group(0).lower():
            val *= 1000
        constraints["voltage"] = {"value": val, "unit": "V", "raw": v_match.group(0)}

    # Power (e.g. 15 kW, 5 HP, 100 W, 50 MW)
    p_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:kW|HP|W|MW)\b', text, re.IGNORECASE)
    if p_match:
        val = float(p_match.group(1))
        unit = p_match.group(0).split()[-1].upper() if ' ' in p_match.group(0) else re.findall(r'[a-zA-Z]+', p_match.group(0))[0].upper()
        constraints["power"] = {"value": val, "unit": unit, "raw": p_match.group(0)}

    # Frequency (e.g. 50 Hz, 60Hz)
    f_match = re.search(r'(\d+(?:\.\d+)?)\s*Hz\b', text, re.IGNORECASE)
    if f_match:
        constraints["frequency"] = {"value": float(f_match.group(1)), "unit": "Hz"}

    # IP Rating (e.g. IP55, IP66, IP67, IP68)
    ip_match = re.search(r'\bIP\s*(\d{2})\b', text, re.IGNORECASE)
    if ip_match:
        constraints["ip_rating"] = f"IP{ip_match.group(1)}"

    # Steel Grades (e.g. Fe 500D, Fe 415, Fe 550, Grade 304, Grade 43)
    grade_match = re.search(r'\b(Fe\s*\d{3}[A-Z]?|Grade\s*\d+[A-Z]?|M\s*\d{2})\b', text, re.IGNORECASE)
    if grade_match:
        constraints["grade"] = grade_match.group(1).upper()

    # Environmental / Operational mode (Indoor vs Outdoor)
    if re.search(r'\boutdoor\b', text, re.IGNORECASE):
        constraints["environment"] = "outdoor"
    elif re.search(r'\bindoor\b', text, re.IGNORECASE):
        constraints["environment"] = "indoor"

    return constraints

def compile_query(raw_query: str) -> Dict[str, Any]:
    """
    Compiles raw user input into a canonical Requirement Representation:
    - raw_query: original input text
    - clean_query: preprocessed query string
    - exact_is: list of explicit IS numbers cited in text
    - trade_matches: recognized Indian trade terms and synonyms
    - constraints: deterministic numbers, units, ranges, environment
    - query_type: EXACT | SEARCH | TENDER | SPECIFICATION
    """
    clean_text = raw_query.strip()
    
    # 1. Extract any explicitly mentioned IS numbers (e.g., IS:1786, IS 1239 Part 1, handles 1S:4992 OCR typo)
    is_pattern = r'\b([1I]S(?:\s*[:\-\s]?\s*\d+(?:\s*(?:Part|Pt)?\s*\d+)?(?:\s*[:/]\s*\d{4})?))\b'
    is_raw_matches = list(re.finditer(is_pattern, clean_text, re.IGNORECASE))
    exact_is_list = []
    auxiliary_is_list = []
    for m in is_raw_matches:
        match_str = m.group(0)
        norm_match = re.sub(r'^[1I]S', 'IS', match_str, flags=re.IGNORECASE)
        parsed = parse_is_identifier(norm_match)
        if parsed.get("valid"):
            # Check if this IS code is purely an auxiliary finish/coating specification
            start_pos = m.start()
            prefix_window = clean_text[max(0, start_pos - 40):start_pos].lower()
            if any(w in prefix_window for w in ["coating", "anodised", "anodic", "oxidised", "plating", "primer as per", "grade ac"]):
                auxiliary_is_list.append(parsed)
            else:
                exact_is_list.append(parsed)

    # Append auxiliary finishes after primary product standards
    exact_is_list.extend(auxiliary_is_list)

    # 2. Multilingual Processing & Cross-Lingual Projection
    indic_info = translate_indic_procurement_query(clean_text)
    lower_query = clean_text.lower()
    
    # Match database-backed trade aliases & colloquial procurement terms (SQLite standard_aliases)
    trade_matches = list(indic_info.get("trade_hits", []))
    db_matches = alias_repository.find_matches_in_text(clean_text)
    for dm in db_matches:
        if not any(tm["term"] == dm["term"] for tm in trade_matches):
            trade_matches.append(dm)

    # 3. Deterministic constraint extraction
    constraints = extract_units_and_numbers(clean_text)
    if indic_info.get("is_multilingual"):
        # Check canonical english representation for any additional numbers/units
        canon_constraints = extract_units_and_numbers(indic_info.get("canonical_english", ""))
        for k, v in canon_constraints.items():
            if k not in constraints:
                constraints[k] = v

    # 4. Determine primary routing strategy
    if exact_is_list and len(clean_text.split()) <= 4:
        query_type = "EXACT"
    elif len(clean_text.split()) > 40 or "\n" in clean_text:
        query_type = "TENDER_SPEC"
    else:
        query_type = "HYBRID_SEARCH"

    # 5. Domain Acronym and Technical Synonym Expansion
    TECHNICAL_SYNONYMS = {
        r'\bunplasticized\s+(?:polyvinyl\s+chloride|pvc)\b': "upvc",
        r'\bpvc\b': "polyvinyl chloride upvc",
        r'\bgi\b': "galvanized steel zinc coated",
        r'\brcc\b': "reinforced concrete",
        r'\bgate valves?\b': "sluice valve",
        r'\bsluice valves?\b': "gate valve",
        r'\bdiesel engines?\b': "compression ignition",
        r'\binduction motors?\b': "line operated three phase a.c. motors",
        r'\benergy meters?\b': "ac static watt-hour",
        r'\bsmart meters?\b': "ac static watt-hour",
        r'\bsafety shoes?\b': "safety footwear",
        r'\bsurgical masks?\b': "medical face masks",
        r'\benamel paint\b': "synthetic exterior enamel finishing",
        r'\bred oxide\b': "zinc chrome priming",
        r'\bmccb\b': "moulded case circuit breakers low-voltage switchgear",
        r'\brccb\b': "residual current operated circuit breakers without integral overcurrent",
        r'\brcbo\b': "residual current operated circuit breakers with integral overcurrent",
        r'\bmcb\b': "miniature circuit breaker overcurrent protection",
        r'\bhrc fuse\b': "high rupturing capacity low voltage fuses",
        r'\bxlpe\b': "crosslinked polyethylene insulated",
        r'\blszh\b': "low smoke zero halogen fire survival cables"
    }

    expanded_terms = [clean_text]
    if indic_info.get("is_multilingual"):
        expanded_terms.append(indic_info.get("canonical_english", ""))
        for t in indic_info.get("expanded_terms", []):
            expanded_terms.append(t)

    for tm in trade_matches:
        expanded_terms.append(tm["product"])

    # Zero-shot canonicalization fallback via sovereign BharatGPT-3B for novel terms
    if not trade_matches and not exact_is_list and 2 <= len(clean_text.split()) <= 15:
        try:
            from services.bharatgpt_service import bharatgpt_engine
            if bharatgpt_engine.is_available():
                canonical_desc = bharatgpt_engine.canonicalize_trade_entity(clean_text)
                if canonical_desc:
                    expanded_terms.append(canonical_desc)
        except Exception:
            pass

    for pattern, syn in TECHNICAL_SYNONYMS.items():
        if re.search(pattern, lower_query) or (indic_info.get("is_multilingual") and re.search(pattern, indic_info.get("canonical_english", "").lower())):
            expanded_terms.append(syn)

    # 5. Universal Procurement Archetype Classification
    archetype_info = archetype_classifier.classify(raw_query)

    # 6. Action 1: Product / Domain Canonical Engineering Classification
    query_for_classification = indic_info.get("canonical_english", clean_text)
    product_spec = product_classifier.classify(query_for_classification)

    return {
        "raw_query": raw_query,
        "clean_query": clean_text,
        "search_text": " ".join(expanded_terms),
        "exact_is": exact_is_list,
        "trade_matches": trade_matches,
        "constraints": constraints,
        "classification": product_spec,
        "product": product_spec["product"],
        "domain": product_spec["domain"],
        "material": product_spec["material"],
        "form": product_spec["form"],
        "standard_type": product_spec["standard_type"],
        "query_type": query_type,
        "detected_script": indic_info.get("detected_script", "latin"),
        "is_multilingual": indic_info.get("is_multilingual", False),
        "canonical_english": indic_info.get("canonical_english", clean_text),
        "archetype": archetype_info["archetype"],
        "archetype_details": archetype_info
    }
