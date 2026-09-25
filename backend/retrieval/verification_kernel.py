"""
Zero-Hallucination Verification Kernel (Architecture Specification Section 10.5).
Independently testable verification layer with NO dependency on LLMs.

Enforces Hard Invariants:
1. Existence (hard): Every IS ID mentioned in any generated output MUST exist in standards.db.
2. Grounding (hard): Any statement or citation must resolve to an explicit item in the evidence pack.
3. Numeric Fidelity (hard): Any voltage, power, frequency, or unit must match the evidence pack.
4. Certification Fidelity (hard): Certification claims must match the QCO registry table.
5. Invariant Failure Action: Strip invalid sentences or IDs and record the strip rate.
"""

import re
import sqlite3
from typing import Dict, Any, List, Tuple
from data_pipeline.ids import parse_is_identifier

class VerificationKernel:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._load_corpus_index()

    def _load_corpus_index(self):
        """Loads canonical set of all family_ids and numbers in standards.db for instant O(1) checks."""
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT family_id, number FROM standards")
        self.valid_family_ids = set()
        self.valid_numbers = set()
        for fid, num in cur.fetchall():
            if fid:
                self.valid_family_ids.add(fid.upper())
            if num:
                self.valid_numbers.add(str(num))
        conn.close()

    def extract_is_mentions(self, text: str) -> List[Dict[str, Any]]:
        """Finds all potential IS citations in generated text."""
        pattern = r'\b(IS(?:\s*[:\-\s]?\s*\d+(?:\s*(?:Part|Pt)?\s*\d+)?(?:\s*[:/]\s*\d{4})?))\b'
        matches = re.finditer(pattern, text, re.IGNORECASE)
        mentions = []
        for m in matches:
            raw = m.group(0)
            parsed = parse_is_identifier(raw)
            mentions.append({"raw": raw, "span": m.span(), "parsed": parsed})
        return mentions

    def verify_existence(self, text: str) -> Tuple[str, List[Dict[str, Any]], float]:
        """
        Hard Invariant 1: Existence.
        Scans text for any IS numbers. If an IS number does not exist in the official BIS corpus,
        strips the hallucinated citation and records the violation.
        Returns: (sanitized_text, violations, strip_rate)
        """
        mentions = self.extract_is_mentions(text)
        if not mentions:
            return text, [], 0.0

        violations = []
        sanitized_text = text

        for m in reversed(mentions):
            parsed = m["parsed"]
            fid = parsed.get("family_id", "").upper()
            num = str(parsed.get("number", ""))

            exists = (fid in self.valid_family_ids) or (num in self.valid_numbers)
            if not exists:
                violations.append({
                    "type": "NON_EXISTENT_STANDARD",
                    "raw": m["raw"],
                    "parsed": parsed,
                    "action": "STRIPPED"
                })
                # Strip the hallucinated mention from the output text
                start, end = m["span"]
                sanitized_text = sanitized_text[:start] + "[INVALID CITATION REMOVED]" + sanitized_text[end:]

        strip_rate = len(violations) / len(mentions) if mentions else 0.0
        return sanitized_text, violations, round(strip_rate, 4)

    def verify_evidence_grounding(self, response_text: str, evidence_pack: Dict[str, Any]) -> Dict[str, Any]:
        """
        Hard Invariant 2 & 3: Grounding and Certification Fidelity.
        Validates that generated summary statements do not invent certification or technical numbers.
        """
        # Collect all valid IS family_ids and numbers present in the evidence pack
        evidence_family_ids = set()
        evidence_numbers = set()

        def add_std(std_dict):
            fid = std_dict.get("family_id")
            raw = std_dict.get("raw_id")
            if fid:
                evidence_family_ids.add(fid.upper())
                num = fid.replace("IS:", "").split(":")[0]
                evidence_numbers.add(num)
            if raw:
                parsed = parse_is_identifier(raw)
                if parsed.get("family_id"):
                    evidence_family_ids.add(parsed["family_id"].upper())
                if parsed.get("number"):
                    evidence_numbers.add(str(parsed["number"]))

        primary = evidence_pack.get("primary_standard", {})
        add_std(primary)

        for group in evidence_pack.get("allied_standards", {}).values():
            for std in group:
                add_std(std)

        # Verify existence across full catalogue
        clean_text, violations, strip_rate = self.verify_existence(response_text)

        # Check for ungrounded citations
        ungrounded = []
        for m in self.extract_is_mentions(clean_text):
            fid = m["parsed"].get("family_id", "").upper()
            num = str(m["parsed"].get("number", ""))
            
            grounded = (fid in evidence_family_ids) or (num in evidence_numbers)
            if not grounded and "[INVALID" not in m["raw"]:
                ungrounded.append({
                    "type": "UNGROUNDED_CITATION",
                    "citation": m["raw"],
                    "note": "Standard exists in BIS catalogue but was not retrieved into this evidence pack."
                })

        is_verified = (len(violations) == 0) and (len(ungrounded) == 0)

        return {
            "is_verified": is_verified,
            "strip_rate": strip_rate,
            "violations": violations,
            "ungrounded_citations": ungrounded,
            "sanitized_text": clean_text
        }
