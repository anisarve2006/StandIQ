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

# Indian Trade & Procurement Colloquial Lexicon (Hinglish to Technical Entities)
TRADE_LEXICON = {
    "sariya": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "tmt": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "rebar": {"product": "steel bars for concrete reinforcement", "family_id": "IS:1786", "division": "Civil Engineering"},
    "chuna": {"product": "building lime", "family_id": "IS:712", "division": "Civil Engineering"},
    "pani ki motor": {"product": "submersible pumpsets for clear water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "submersible pump": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "submersible pumpset": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "submersible": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "monoset pump": {"product": "monoset pumps for clear cold fresh water", "family_id": "IS:9079", "division": "Mechanical Engineering"},
    "pvc pipe": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "gi pipe": {"product": "steel tubes and tubulars for water gas and air", "family_id": "IS:1239", "division": "Civil Engineering"},
    "safety shoe": {"product": "personal protective equipment safety footwear", "family_id": "IS:15298:P2", "division": "Chemical"},
    "safety footwear": {"product": "personal protective equipment safety footwear", "family_id": "IS:15298:P2", "division": "Chemical"},
    "safety helmet": {"product": "industrial safety helmets", "family_id": "IS:2925", "division": "Civil Engineering"},
    "fire extinguisher": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "ceiling fan": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "led bulb": {"product": "self-ballasted led lamps for general lighting", "family_id": "IS:16102:P1", "division": "Electrotechnical"},
    "led luminaire": {"product": "luminaires for road and street lighting", "family_id": "IS:10322:P5:S3", "division": "Electrotechnical"},
    "water purifier": {"product": "point of use water purifiers", "family_id": "IS:16240", "division": "Water Resources"},
    "packaged water": {"product": "packaged drinking water other than natural mineral water", "family_id": "IS:14543", "division": "Food and Agriculture"},
    "packaged drinking water": {"product": "packaged drinking water other than natural mineral water", "family_id": "IS:14543", "division": "Food and Agriculture"},
    "mineral water": {"product": "packaged natural mineral water", "family_id": "IS:13428", "division": "Food and Agriculture"},
    "pvc cable": {"product": "pvc insulated unsheathed-and-sheathed cables", "family_id": "IS:694", "division": "Electrotechnical"},
    "pvc insulated cable": {"product": "pvc insulated unsheathed-and-sheathed cables", "family_id": "IS:694", "division": "Electrotechnical"},
    "surgical glove": {"product": "sterile surgical rubber gloves disposable", "family_id": "IS:13422", "division": "Medical and Healthcare"},
    "surgical gloves": {"product": "sterile surgical rubber gloves disposable", "family_id": "IS:13422", "division": "Medical and Healthcare"},
    "rubber glove": {"product": "sterile surgical rubber gloves disposable", "family_id": "IS:13422", "division": "Medical and Healthcare"},
    "rubber gloves": {"product": "sterile surgical rubber gloves disposable", "family_id": "IS:13422", "division": "Medical and Healthcare"},
    "digital thermometer": {"product": "clinical electrical thermometers with maximum device", "family_id": "IS:15113", "division": "Medical and Healthcare"},
    "electrical thermometer": {"product": "clinical electrical thermometers with maximum device", "family_id": "IS:15113", "division": "Medical and Healthcare"},
    "fertilizer grade urea": {"product": "urea fertilizer grade", "family_id": "IS:5406", "division": "Chemical"},
    "sanitary pad": {"product": "sanitary napkins", "family_id": "IS:5405", "division": "Textiles"},
    "plywood": {"product": "plywood for general purposes", "family_id": "IS:303", "division": "Civil Engineering"},
    "transformer": {"product": "outdoor distribution transformers", "family_id": "IS:1180:P1", "division": "Electrotechnical"},
    "fe 500": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "fe 500d": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "fe 415": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "fe 550": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "fe 550d": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "opc 43": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "opc 53": {"product": "ordinary portland cement 53 grade", "family_id": "IS:12269", "division": "Civil Engineering"},
    "ppc": {"product": "portland pozzolana cement", "family_id": "IS:1489:P1", "division": "Civil Engineering"},
    "cctv": {"product": "information technology equipment safety", "family_id": "IS:13252:P1", "division": "Electronics and IT"},
    "cctv camera": {"product": "information technology equipment safety", "family_id": "IS:13252:P1", "division": "Electronics and IT"},
    "laptop": {"product": "laptop notebook computers", "family_id": "IS:13252:P1", "division": "Electronics and IT"},
    "ups": {"product": "uninterruptible power systems", "family_id": "IS:16242:P1", "division": "Electrotechnical"},
    "uninterruptible power": {"product": "uninterruptible power systems", "family_id": "IS:16242:P1", "division": "Electrotechnical"},
    "sluice valve": {"product": "sluice valve for water works purposes", "family_id": "IS:14846", "division": "Mechanical Engineering"},
    "gate valve": {"product": "sluice valve for water works purposes", "family_id": "IS:14846", "division": "Mechanical Engineering"},
    "diesel engine": {"product": "constant speed compression ignition diesel engines", "family_id": "IS:10001", "division": "Mechanical Engineering"},
    "static watt-hour": {"product": "ac static watt-hour energy meters", "family_id": "IS:13779", "division": "Electrotechnical"},
    "energy efficient motor": {"product": "line operated three phase ac motors efficiency classes", "family_id": "IS:12615", "division": "Electrotechnical"},
    "energy efficient induction motor": {"product": "line operated three phase ac motors efficiency classes", "family_id": "IS:12615", "division": "Electrotechnical"},
    "monobloc pump": {"product": "monoset pumps for clear cold fresh water", "family_id": "IS:9079", "division": "Mechanical Engineering"},
    "monobloc": {"product": "monoset pumps for clear cold fresh water", "family_id": "IS:9079", "division": "Mechanical Engineering"},
    "synthetic enamel": {"product": "synthetic enamel exterior", "family_id": "IS:9034", "division": "Chemical"},
    "synthetic enamel paint": {"product": "synthetic enamel exterior", "family_id": "IS:9034", "division": "Chemical"},
    "red oxide primer": {"product": "ready mixed paint red oxide primer", "family_id": "IS:11883", "division": "Chemical"},
    "bleaching powder": {"product": "bleaching powder stable", "family_id": "IS:1065", "division": "Chemical"},
    "stable bleaching powder": {"product": "bleaching powder stable", "family_id": "IS:1065", "division": "Chemical"},
    "surgical mask": {"product": "medical face masks surgical masks", "family_id": "IS:16289", "division": "Medical and Healthcare"},
    "medical face mask": {"product": "medical face masks surgical masks", "family_id": "IS:16289", "division": "Medical and Healthcare"},
    "hypodermic syringe": {"product": "sterile hypodermic syringes for single use", "family_id": "IS:10258", "division": "Medical and Healthcare"},
    "carbon steel tube": {"product": "steel tubes for mechanical and general engineering", "family_id": "IS:3601", "division": "Mechanical Engineering"},
    "carbon steel pipe": {"product": "steel tubes for mechanical and general engineering", "family_id": "IS:3601", "division": "Mechanical Engineering"},
    "gold jewellery": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "gold coin": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "hallmark": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "silver jewellery": {"product": "silver and silver alloys jewellery artefacts fineness marking", "family_id": "IS:2112", "division": "Metallurgical Engineering"},
    # Devanagari Hindi Technical Procurement Lexicon
    "सरिया": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "सीमेंट": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "चूना": {"product": "building lime", "family_id": "IS:712", "division": "Civil Engineering"},
    "पानी की मोटर": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "सबमर्सिबल": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ट्रांसफॉर्मर": {"product": "outdoor distribution transformers", "family_id": "IS:1180:P1", "division": "Electrotechnical"},
    "पंखा": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "सुरक्षा जूते": {"product": "personal protective equipment safety footwear", "family_id": "IS:15298:P2", "division": "Chemical"},
    "सुरक्षा हेलमेट": {"product": "industrial safety helmets", "family_id": "IS:2925", "division": "Civil Engineering"},
    "अग्निशामक": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "सोना": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "हॉलमार्क": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    # Sanitary Ware & Plumbing Fixtures
    "wash basin": {"product": "vitreous sanitary appliances specific requirements of wash basins", "family_id": "IS:2556:P4", "division": "Civil Engineering"},
    "wash-basin": {"product": "vitreous sanitary appliances specific requirements of wash basins", "family_id": "IS:2556:P4", "division": "Civil Engineering"},
    "flat back wash basin": {"product": "vitreous sanitary appliances specific requirements of wash basins", "family_id": "IS:2556:P4", "division": "Civil Engineering"},
    "squatting pan": {"product": "vitreous sanitary appliances specific requirements of squatting pans", "family_id": "IS:2556:P3", "division": "Civil Engineering"},
    "orissa pattern": {"product": "vitreous sanitary appliances specific requirements of squatting pans", "family_id": "IS:2556:P3", "division": "Civil Engineering"},
    "orissa pattern w.c pan": {"product": "vitreous sanitary appliances specific requirements of squatting pans", "family_id": "IS:2556:P3", "division": "Civil Engineering"},
    "flushing cistern": {"product": "plastic flushing cisterns for water closets", "family_id": "IS:7231", "division": "Civil Engineering"},
    "pvc flushing cistern": {"product": "plastic flushing cisterns for water closets", "family_id": "IS:7231", "division": "Civil Engineering"},
    "kitchen sink": {"product": "stainless steel sinks for domestic purposes", "family_id": "IS:13983", "division": "Civil Engineering"},
    "stainless steel sink": {"product": "stainless steel sinks for domestic purposes", "family_id": "IS:13983", "division": "Civil Engineering"},
    "cpvc pipe": {"product": "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water", "family_id": "IS:17546", "division": "Civil Engineering"},
    "cpvc pipes": {"product": "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water", "family_id": "IS:17546", "division": "Civil Engineering"},
    "chlorinated polyvinyl chloride": {"product": "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water", "family_id": "IS:17546", "division": "Civil Engineering"},
    "rigid pvc pipe": {"product": "upvc pipes for soil and waste discharge systems", "family_id": "IS:13592", "division": "Civil Engineering"},
    "rigid pvc pipes": {"product": "upvc pipes for soil and waste discharge systems", "family_id": "IS:13592", "division": "Civil Engineering"},
    # Door, Window & Hardware Fittings
    "flush door": {"product": "wooden flush door shutters solid core", "family_id": "IS:2202:P1", "division": "Civil Engineering"},
    "flush door shutter": {"product": "wooden flush door shutters solid core", "family_id": "IS:2202:P1", "division": "Civil Engineering"},
    "flush door shutters": {"product": "wooden flush door shutters solid core", "family_id": "IS:2202:P1", "division": "Civil Engineering"},
    "door handle": {"product": "door handles for mortice lock vertical type", "family_id": "IS:4992", "division": "Civil Engineering"},
    "door handles": {"product": "door handles for mortice lock vertical type", "family_id": "IS:4992", "division": "Civil Engineering"},
    "m.s. handle": {"product": "door handles for mortice lock vertical type", "family_id": "IS:4992", "division": "Civil Engineering"},
    "m.s. handles": {"product": "door handles for mortice lock vertical type", "family_id": "IS:4992", "division": "Civil Engineering"},
    "casement stay": {"product": "mild steel stays and fasteners", "family_id": "IS:10019", "division": "Civil Engineering"},
    "casement stays": {"product": "mild steel stays and fasteners", "family_id": "IS:10019", "division": "Civil Engineering"},
    "sliding door bolt": {"product": "non-ferrous metal sliding door bolts aldrops for padlocks", "family_id": "IS:2681", "division": "Civil Engineering"},
    "sliding door bolts": {"product": "non-ferrous metal sliding door bolts aldrops for padlocks", "family_id": "IS:2681", "division": "Civil Engineering"},
    "tower bolt": {"product": "tower bolts non-ferrous metals", "family_id": "IS:204:P2", "division": "Civil Engineering"},
    "tower bolts": {"product": "tower bolts non-ferrous metals", "family_id": "IS:204:P2", "division": "Civil Engineering"},
    "pull bolt lock": {"product": "tower bolts non-ferrous metals", "family_id": "IS:204:P2", "division": "Civil Engineering"},
    "door stopper": {"product": "floor door stoppers", "family_id": "IS:1823", "division": "Civil Engineering"},
    "hanging floor door stopper": {"product": "floor door stoppers", "family_id": "IS:1823", "division": "Civil Engineering"},
    "pressed steel door frame": {"product": "steel door frames", "family_id": "IS:4351", "division": "Civil Engineering"},
    "pressed steel door frames": {"product": "steel door frames", "family_id": "IS:4351", "division": "Civil Engineering"},
    # Civil, Tiles, Masonry & Finishing
    "acrylic sheet": {"product": "polymethyl methacrylate pmma acrylic sheets", "family_id": "IS:14753", "division": "Chemical"},
    "acrylic sheets": {"product": "polymethyl methacrylate pmma acrylic sheets", "family_id": "IS:14753", "division": "Chemical"},
    "vitrified tile": {"product": "pressed ceramic tiles", "family_id": "IS:15622", "division": "Civil Engineering"},
    "vitrified tiles": {"product": "pressed ceramic tiles", "family_id": "IS:15622", "division": "Civil Engineering"},
    "ceramic glazed floor tiles": {"product": "pressed ceramic tiles", "family_id": "IS:15622", "division": "Civil Engineering"},
    "ceramic glazed wall tiles": {"product": "pressed ceramic tiles", "family_id": "IS:15622", "division": "Civil Engineering"},
    "tile adhesive": {"product": "adhesives for use with ceramic tiles and mosaics", "family_id": "IS:15477", "division": "Civil Engineering"},
    "burnt clay brick": {"product": "common burnt clay building bricks", "family_id": "IS:1077", "division": "Civil Engineering"},
    "burnt clay bricks": {"product": "common burnt clay building bricks", "family_id": "IS:1077", "division": "Civil Engineering"},
    "distemper": {"product": "distemper dry colour", "family_id": "IS:428", "division": "Chemical"},
    "acrylic distemper": {"product": "distemper dry colour", "family_id": "IS:428", "division": "Chemical"},
    "aluminium primer": {"product": "ready mixed paint aluminium primer for resinous wood", "family_id": "IS:3585", "division": "Chemical"},
    "water proofing cement compound": {"product": "integral waterproofing compounds for cement mortar and concrete", "family_id": "IS:2645", "division": "Civil Engineering"},
    "plaster of paris": {"product": "gypsum plaster", "family_id": "IS:2547", "division": "Civil Engineering"},
    "kota stone": {"product": "limestone slab and tiles", "family_id": "IS:1128", "division": "Civil Engineering"},
    "kota stone slab": {"product": "limestone slab and tiles", "family_id": "IS:1128", "division": "Civil Engineering"},
    "kota stone slabs": {"product": "limestone slab and tiles", "family_id": "IS:1128", "division": "Civil Engineering"},
    "marble slab": {"product": "marble blocks slabs and tiles", "family_id": "IS:1130", "division": "Civil Engineering"},
    "marble slabs": {"product": "marble blocks slabs and tiles", "family_id": "IS:1130", "division": "Civil Engineering"},
    "white marble": {"product": "marble blocks slabs and tiles", "family_id": "IS:1130", "division": "Civil Engineering"},
    "green marble": {"product": "marble blocks slabs and tiles", "family_id": "IS:1130", "division": "Civil Engineering"},
    "granite stone": {"product": "polished building stones granite and similar stones", "family_id": "IS:14223:P1", "division": "Civil Engineering"},
    "watch and ward": {"product": "quality management systems for security services", "family_id": "IS/ISO:9001", "division": "Management and Systems"},
    "liquid nitrogen": {"product": "nitrogen compressed gas and liquid specification", "family_id": "IS:1747", "division": "Chemical"},
    "compressed nitrogen": {"product": "nitrogen compressed gas and liquid specification", "family_id": "IS:1747", "division": "Chemical"},
    "cryogenic liquid": {"product": "code of safety for handling cryogenic liquids", "family_id": "IS:5931", "division": "Chemical"},
    "cryogenic liquids": {"product": "code of safety for handling cryogenic liquids", "family_id": "IS:5931", "division": "Chemical"},
    "cryogenic tank": {"product": "code for unfired pressure vessels", "family_id": "IS:2825", "division": "Mechanical Engineering"},
    "cryogenic vessel": {"product": "liquid nitrogen vessels", "family_id": "IS:11552", "division": "Chemical"},
    "plain g.s. sheet": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "plain g.s.": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "g.s. sheet": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "gs sheet": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "plain gs sheet": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "g.i. profile sheet": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "gi profile sheet": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"},
    "ridges or hips": {"product": "galvanized steel strips and sheets plain and corrugated", "family_id": "IS:277", "division": "Metallurgical Engineering"}
}

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
    
    # Match trade lexicon & colloquial names (supports plural -s, -es, -sets)
    trade_matches = []
    # Include hits from cross-lingual lexicon
    for hit in indic_info.get("trade_hits", []):
        trade_matches.append(hit)

    lower_query = clean_text.lower()
    for term, meta in TRADE_LEXICON.items():
        if any(ord(c) > 127 for c in term):
            if term in clean_text:
                if not any(tm["term"] == term for tm in trade_matches):
                    trade_matches.append({"term": term, **meta})
        else:
            if term == "ups":
                # Ensure 'ups' is not preceded by 'touch' (e.g. 'touch ups' in stone/finishing)
                if re.search(r'(?<!touch\s)\bups\b', lower_query):
                    if not any(tm["term"] == term for tm in trade_matches):
                        trade_matches.append({"term": term, **meta})
            elif re.search(rf'\b{re.escape(term)}(?:s|es|sets?)?\b', lower_query):
                if not any(tm["term"] == term for tm in trade_matches):
                    trade_matches.append({"term": term, **meta})

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
        r'\bpvc\b': "polyvinyl chloride",
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
        r'\bred oxide\b': "zinc chrome priming"
    }

    expanded_terms = [clean_text]
    if indic_info.get("is_multilingual"):
        expanded_terms.append(indic_info.get("canonical_english", ""))
        for t in indic_info.get("expanded_terms", []):
            expanded_terms.append(t)

    for tm in trade_matches:
        expanded_terms.append(tm["product"])

    for pattern, syn in TECHNICAL_SYNONYMS.items():
        if re.search(pattern, lower_query) or (indic_info.get("is_multilingual") and re.search(pattern, indic_info.get("canonical_english", "").lower())):
            expanded_terms.append(syn)

    # 5. Universal Procurement Archetype Classification
    archetype_info = archetype_classifier.classify(raw_query)

    return {
        "raw_query": raw_query,
        "clean_query": clean_text,
        "search_text": " ".join(expanded_terms),
        "exact_is": exact_is_list,
        "trade_matches": trade_matches,
        "constraints": constraints,
        "query_type": query_type,
        "detected_script": indic_info.get("detected_script", "latin"),
        "is_multilingual": indic_info.get("is_multilingual", False),
        "canonical_english": indic_info.get("canonical_english", clean_text),
        "archetype": archetype_info["archetype"],
        "archetype_details": archetype_info
    }
