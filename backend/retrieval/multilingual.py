"""
Sovereign Multilingual & Indic Natural Language Processing Engine.
Architecture Layer: Indic Linguistic Processing & Cross-Lingual Query Normalization.

Supports:
- Script Detection (Devanagari, Tamil, Telugu, Kannada, Bengali, Gujarati, Malayalam, Roman/Hinglish)
- Technical Entity Guard (Masking & Unmasking of engineering units, standard numbers, grades)
- Multi-Script Indian Trade Lexicon across 8 scheduled Indian languages
- Rule-based & Domain-Grounded Indic to English Technical Translation
- Optional integration hooks for AI4Bharat IndicTrans2 & Digital India Bhashini APIs
"""

import re
import unicodedata
from typing import Dict, Any, Tuple, List, Optional

# Unicode Script Ranges
SCRIPT_RANGES = {
    "devanagari": (0x0900, 0x097F),  # Hindi, Marathi, Sanskrit, Nepali
    "bengali": (0x0980, 0x09FF),     # Bengali, Assamese
    "gujarati": (0x0A80, 0x0AFF),    # Gujarati
    "gurmukhi": (0x0A00, 0x0A7F),    # Punjabi
    "tamil": (0x0B80, 0x0BFF),       # Tamil
    "telugu": (0x0C00, 0x0C7F),      # Telugu
    "kannada": (0x0C80, 0x0CFF),     # Kannada
    "malayalam": (0x0D00, 0x0D7F),   # Malayalam
    "odia": (0x0B00, 0x0B7F)         # Odia
}

def detect_script(text: str) -> str:
    """Detects the primary Indic script or returns 'latin' for ASCII/Romanized text."""
    counts = {script: 0 for script in SCRIPT_RANGES}
    latin_count = 0

    for char in text:
        cp = ord(char)
        found = False
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= cp <= end:
                counts[script] += 1
                found = True
                break
        if not found and ('a' <= char.lower() <= 'z'):
            latin_count += 1

    max_script = max(counts, key=counts.get)
    if counts[max_script] > 0:
        return max_script
    return "latin"

def mask_technical_entities(text: str) -> Tuple[str, Dict[str, str]]:
    """
    Entity Guard: Masks engineering parameters, standard codes, and physical units
    with unique placeholders so that translation or linguistic engines do not corrupt them.
    """
    masks = {}
    
    # Matches IS codes, Fe grades, metric dimensions, power, voltage, IP ratings
    pattern = (
        r'(IS\s*[:\-\s]?\s*\d+(?:\s*(?:Part|Pt)?\s*\d+)?(?:\s*[:/]\s*\d{4})?|'
        r'Fe\s*\d{3}[A-Z]?|Grade\s*\d+[A-Z]?|M\s*\d{2}|'
        r'\bIP\s*\d{2}\b|'
        r'\d+(?:\.\d+)?\s*(?:mm|cm|m|km|kV|V|volts?|kW|HP|W|MW|Hz|kg|litres?|ltr)\b)'
    )

    def replacer(match):
        token = f"__TECH_PARAM_{len(masks)}__"
        masks[token] = match.group(0).strip()
        return f" {token} "

    masked_text = re.sub(pattern, replacer, text, flags=re.IGNORECASE)
    # Normalize multiple spaces
    masked_text = re.sub(r'\s+', ' ', masked_text).strip()
    return masked_text, masks

def unmask_technical_entities(text: str, masks: Dict[str, str]) -> str:
    """Restores masked engineering parameters back to their exact original text."""
    restored = text
    for token, original in masks.items():
        restored = restored.replace(token, original)
        # Also handle potential lowercase alteration by translation engines
        restored = restored.replace(token.lower(), original)
    return restored

# Cross-Lingual Indic Trade Lexicon (8 Languages -> Canonical BIS Standard & English Definition)
CROSS_LINGUAL_LEXICON: Dict[str, Dict[str, Any]] = {
    # --- Steel Rebar / TMT (IS 1786) ---
    "सरिया": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "गज": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "लोखंडी गज": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "कंबी": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "கம்பி": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "டிஎம்டி கம்பி": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "కడ్డీ": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "స్టీల్ కడ్డీలు": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "రడ్": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "রড": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "সળિયા": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "સળિયા": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "കമ്പി": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "ടിഎംടി": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "ಸರಳು": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "ಕಬ್ಬಿಣದ ಸರಳು": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "ਸਰਿਆ": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},
    "ਰਡ୍": {"product": "high strength deformed steel bars and wires", "family_id": "IS:1786", "division": "Civil Engineering"},

    # --- Cement (IS 8112 / IS 12269) ---
    "सीमेंट": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "सिमेंट": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "சிமெண்ட்": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "సిమెంట్": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "ಸಿಮೆಂಟ್": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "সিমেন্ট": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "સિમેન્ટ": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "സിമന്റ്": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "ਸੀਮਿੰਟ": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},
    "ସିମେଣ୍ଟ": {"product": "ordinary portland cement 43 grade", "family_id": "IS:8112", "division": "Civil Engineering"},

    # --- Submersible Pump (IS 8034) ---
    "पानी की मोटर": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "सबमर्सिबल": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "पाण्याचा पंप": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "विंधन विहीर पंप": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "தண்ணீர் மோட்டார்": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "மூழ்கும் பம்ப்": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "నీటి మోటారు": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "సబ్‌మెర్సిబుల్ పంప్": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ನೀರಿನ ಮೋಟರ್": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ಸಬ್‌ಮರ್ಸಿಬಲ್ ಪಂಪ್": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ಸಬ್‌ಮರ್ಸಿಬಲ್": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "জলের মোটর": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "પાણીની મોટર": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "വാട്ടർ പമ്പ്": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "സബ്മേഴ്സിബിൾ പമ്പ്": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ਪਾਣੀ ਦੀ ਮੋਟਰ": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ਸਬਮਰਸੀਬਲ ਪੰਪ": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},
    "ସବମର୍ସିବଲ ପମ୍ପ": {"product": "submersible pumpsets for clear cold water", "family_id": "IS:8034", "division": "Mechanical Engineering"},

    # --- Gold & Hallmarking (IS 1417) ---
    "सोना": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "हॉलमार्क": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "सोने": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "தங்கம்": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "ஹால்மார்க்": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "బంగారం": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "చిన్న": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "সোনা": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "સોનું": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},
    "സ്വർണം": {"product": "gold and gold alloys jewellery artefacts fineness marking", "family_id": "IS:1417", "division": "Metallurgical Engineering"},

    # --- Ceiling Fans (IS 374) ---
    "पंखा": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "छताचा पंखा": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "மின்விசிறி": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "ఫ్యాన్": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "পাখা": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},
    "પંખો": {"product": "electric ceiling type fans and regulators", "family_id": "IS:374", "division": "Electrotechnical"},

    # --- Transformers (IS 1180 Part 1) ---
    "ट्रांसफॉर्मर": {"product": "outdoor distribution transformers", "family_id": "IS:1180:P1", "division": "Electrotechnical"},
    "ट्रान्सफॉर्मर": {"product": "outdoor distribution transformers", "family_id": "IS:1180:P1", "division": "Electrotechnical"},
    "மின்மாற்றி": {"product": "outdoor distribution transformers", "family_id": "IS:1180:P1", "division": "Electrotechnical"},
    "ట్రాన్స్‌ఫార్మర్": {"product": "outdoor distribution transformers", "family_id": "IS:1180:P1", "division": "Electrotechnical"},

    # --- Safety Helmet & Footwear ---
    "सुरक्षा जूते": {"product": "personal protective equipment safety footwear", "family_id": "IS:15298:P2", "division": "Chemical"},
    "सुरक्षा हेलमेट": {"product": "industrial safety helmets", "family_id": "IS:2925", "division": "Civil Engineering"},
    "பாதுகாப்பு காலணிகள்": {"product": "personal protective equipment safety footwear", "family_id": "IS:15298:P2", "division": "Chemical"},
    "பாதுகாப்பு தலைக்கவசம்": {"product": "industrial safety helmets", "family_id": "IS:2925", "division": "Civil Engineering"},
    "రక్షణ పాదరక్షలు": {"product": "personal protective equipment safety footwear", "family_id": "IS:15298:P2", "division": "Chemical"},
    "రక్షణ హెल्మెట్": {"product": "industrial safety helmets", "family_id": "IS:2925", "division": "Civil Engineering"},

    # --- Fire Extinguishers (IS 15683) ---
    "अग्निशामक": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "आग विझवणारे यंत्र": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "தீயணைப்பான்": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "అగ్నిమాపక యంత్రం": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "অগ্নিনির্বাপক": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},
    "અગ્નિશામક": {"product": "portable fire extinguishers", "family_id": "IS:15683", "division": "Civil Engineering"},

    # --- Pipes (IS 4985 & IS 1239) ---
    "पीवीसी पाइप": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "पीव्हीसी पाईप": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "नळ पाईप": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "குழாய்": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "పైపు": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "ಪೈಪ್": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "ಪಿವಿಸಿ ಪೈಪ್": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "പൈപ്പ്": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "પીવીસી પાઇપ": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "পিভিসি পাইপ": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "ਪਾਈਪ": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},
    "ପାଇପ": {"product": "unplasticized pvc pipes for potable water supplies", "family_id": "IS:4985", "division": "Civil Engineering"},

    # --- LED Lighting (IS 10322 Part 5 Sec 3) ---
    "एलईडी ल्युमिनेअर": {"product": "luminaires road and street lighting", "family_id": "IS:10322:P5:S3", "division": "Electrotechnical"},
    "தெரு விளக்கு": {"product": "luminaires road and street lighting", "family_id": "IS:10322:P5:S3", "division": "Electrotechnical"},
    "వీధి దీపం": {"product": "luminaires road and street lighting", "family_id": "IS:10322:P5:S3", "division": "Electrotechnical"}

}

# Common Indic Procurement Intent Keywords (Translates auxiliary intent)
INDIC_PROCUREMENT_VOCAB = {
    # Hindi / Marathi
    "के लिए": "for",
    "साठी": "for",
    "की आपूर्ति": "supply of",
    "पुरवठा": "supply of",
    "निर्माण": "construction",
    "बांधकाम": "construction",
    "आवश्यकता": "requirement",
    "गरज": "requirement",
    "निविदा": "tender",
    "टेंडर": "tender",
    "मानक": "standard",
    "प्रमाणपत्र": "certification",
    "घर": "house building",
    "रस्ता": "road",
    "सड़क": "road",

    # Tamil
    "க்கான": "for",
    "கட்டுமானம்": "construction",
    "வழங்கல்": "supply of",
    "தேவை": "requirement",
    "டெண்டர்": "tender",
    "தரநிலை": "standard",
    "சாலை": "road",

    # Telugu
    "కోసం": "for",
    "నిర్మాణం": "construction",
    "సరఫరా": "supply of",
    "అవసరం": "requirement",
    "టెండర్": "tender",
    "రోడ్డు": "road"
}

def get_bharatgpt_engine():
    try:
        from services.bharatgpt_service import bharatgpt_engine
        return bharatgpt_engine
    except Exception:
        return None

def translate_indic_procurement_query(query: str) -> Dict[str, Any]:
    """
    Translates and normalizes an Indic procurement query into canonical English
    while strictly preserving all technical entities and mapping trade terms.
    Uses BharatGPT-3B Indic local GGUF model with automatic fallback to
    the deterministic 8-language trade lexicon.
    """
    script = detect_script(query)
    is_multilingual = (script != "latin")
    
    # 1. Mask technical parameters (Entity Guard)
    masked_query, masks = mask_technical_entities(query)

    # 2. Identify and record trade terms from cross-lingual dictionary
    trade_hits = []
    canonical_terms = []

    for term, meta in CROSS_LINGUAL_LEXICON.items():
        if term in query:
            trade_hits.append({"term": term, **meta})
            canonical_terms.append(meta["product"])

    # 3. Primary Path: Local BharatGPT-3B Indic Neural Translation
    if is_multilingual:
        bgpt = get_bharatgpt_engine()
        if bgpt and bgpt.is_available():
            neural_trans = bgpt.translate_indic(masked_query, script_name=script)
            if neural_trans:
                # Merge canonical product names from trade hits if not already present
                extra_terms = " ".join([m["product"] for m in trade_hits if m["product"].lower() not in neural_trans.lower()])
                combined = f"{neural_trans} {extra_terms}".strip()
                final_canonical = unmask_technical_entities(combined, masks)
                final_canonical = re.sub(r'\s+', ' ', final_canonical).strip()
                return {
                    "original_query": query,
                    "detected_script": script,
                    "is_multilingual": True,
                    "trade_hits": trade_hits,
                    "canonical_english": final_canonical,
                    "expanded_terms": list(set(canonical_terms)),
                    "translation_engine": f"BharatGPT-3B-Indic ({'Modal Serverless' if (bgpt and getattr(bgpt, '_modal_url', None)) else 'Local GGUF'})"
                }

    # 4. Fallback Path: Rule-based Indic intent translation + Trade Lexicon
    translated_text = masked_query
    for indic_w, eng_w in INDIC_PROCUREMENT_VOCAB.items():
        translated_text = translated_text.replace(indic_w, f" {eng_w} ")

    # Replace vernacular terms with canonical English equivalents
    for term, meta in CROSS_LINGUAL_LEXICON.items():
        translated_text = translated_text.replace(term, f" {meta['product']} ")

    # Unmask technical parameters
    final_canonical = unmask_technical_entities(translated_text, masks)
    final_canonical = re.sub(r'\s+', ' ', final_canonical).strip()

    return {
        "original_query": query,
        "detected_script": script,
        "is_multilingual": is_multilingual,
        "trade_hits": trade_hits,
        "canonical_english": final_canonical,
        "expanded_terms": list(set(canonical_terms)),
        "translation_engine": "Deterministic Indic Lexicon (Fallback)"
    }

