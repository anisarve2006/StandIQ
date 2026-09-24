"""
Canonical ID Normalizer for Indian Standards
Converts raw, erratic strings to canonical family_id (e.g., 'IS:1786', 'IS:771:P6')
"""

import re
from typing import Optional, Dict, Any

# Map Devanagari and Eastern Indic digits to ASCII
INDIC_DIGITS_MAP = str.maketrans('०१२३४५६७८९', '0123456789')

def normalize_digits(text: str) -> str:
    """Converts any Devanagari numerals to standard ASCII numerals."""
    if not text:
        return ""
    return text.translate(INDIC_DIGITS_MAP)

def parse_is_identifier(raw: str) -> Dict[str, Any]:
    """
    Parses any variant of an Indian Standard identifier into a structured dictionary:
    - raw: original string
    - prefix: 'IS', 'IS/ISO', 'IS/IEC'
    - number: standard base number e.g. '1786'
    - part: part number if present e.g. '1'
    - section: section number if present e.g. '2'
    - year: year of publication if present e.g. 2008
    - family_id: canonical unique identifier e.g. 'IS:1786', 'IS:771:P6'
    """
    if not raw or not isinstance(raw, str):
        return {"raw": raw, "valid": False}
    
    cleaned = normalize_digits(raw.strip())
    
    # Handle archive.org format: gov.in.is.771.6.1979 or gov.in.is.104.1979 or gov.in.is.12970.3.2.1992
    if cleaned.startswith("gov.in.is."):
        parts = cleaned.replace("gov.in.is.", "").split(".")
        if len(parts) >= 1:
            number = parts[0]
            part = None
            section = None
            year = None
            
            if len(parts) == 2:
                # e.g., 104.1979 -> number 104, year 1979
                if len(parts[1]) == 4 and parts[1].isdigit():
                    year = int(parts[1])
                else:
                    part = parts[1]
            elif len(parts) == 3:
                # e.g. 771.6.1979 -> number 771, part 6, year 1979
                part = parts[1]
                if len(parts[2]) == 4 and parts[2].isdigit():
                    year = int(parts[2])
            elif len(parts) >= 4:
                # e.g. 12970.3.2.1992 -> number 12970, part 3, section 2, year 1992
                part = parts[1]
                section = parts[2]
                if len(parts[3]) == 4 and parts[3].isdigit():
                    year = int(parts[3])
            
            fam = f"IS:{number}"
            if part:
                fam += f":P{part}"
            if section:
                fam += f":S{section}"
            
            return {
                "raw": raw,
                "prefix": "IS",
                "number": number,
                "part": part,
                "section": section,
                "year": year,
                "family_id": fam,
                "valid": True
            }

    # Standard regex for IS numbers:
    # Matches IS 1786, IS:1239, IS 13252(Part 1):2010, IS 771-6, IS/ISO 9001
    pattern = r'^(IS(?:/(?:ISO|IEC))?)\s*[:\-\s]?\s*(\d+)(?:[\s\-\(]*(?:Part|Pt)?\s*(\d+)[\s\)]*)?(?:[\s\-\(]*(?:Sec|Section)?\s*(\d+)[\s\)]*)?(?:\s*[:/]\s*(\d{4}))?'
    match = re.search(pattern, cleaned, re.IGNORECASE)
    
    if match:
        prefix = match.group(1).upper().replace(" ", "")
        number = match.group(2)
        part = match.group(3)
        section = match.group(4)
        year_str = match.group(5)
        year = int(year_str) if year_str else None
        
        fam = f"{prefix}:{number}"
        if part:
            fam += f":P{part}"
        if section:
            fam += f":S{section}"
            
        return {
            "raw": raw,
            "prefix": prefix,
            "number": number,
            "part": part,
            "section": section,
            "year": year,
            "family_id": fam,
            "valid": True
        }
    
    # Fallback: extract any digits
    digits = re.findall(r'\d+', cleaned)
    if digits:
        number = digits[0]
        return {
            "raw": raw,
            "prefix": "IS",
            "number": number,
            "part": digits[1] if len(digits) > 2 else None,
            "section": None,
            "year": int(digits[-1]) if len(digits[-1]) == 4 else None,
            "family_id": f"IS:{number}",
            "valid": True
        }

    return {"raw": raw, "valid": False, "family_id": cleaned.upper()}
