import re
import uuid
from typing import List, Dict, Any, Optional, Tuple
from schemas.api import AuditVulnerabilityFinding, DisputeRiskReport


class AuditRiskService:
    """
    GFR 2017 & Legal Dispute Risk Scoring Engine.
    Evaluates tender specifications across 4 statutory dimensions with dynamic point distribution:
    1. GFR 2017 Rule 144(i) - Mandate of Indian Standards
    2. CVC Anti-Competitive & Restrictive Brand-Tailoring Guidelines
    3. CAG Compliance Audit Vulnerabilities (Superseded Standards & Mandatory QCOs)
    4. Arbitration Traps & Contract Ambiguity (Contract Act §29 & Missing Testing)
    
    Dynamic Point Allocation:
    - Dimension ceilings dynamically adjust based on procurement domain (Civil/Structural vs IT/Electronics vs General).
    - Finding points scale with commodity safety criticality multipliers (Tier 1 Life-Safety: 1.25x).
    - Multi-finding non-linear aggregation prevents artificial flat penalties.
    """

    SUPERSEDED_CATALOG = {
        "IS 8112": {
            "current": "IS 269:2015",
            "name": "43 Grade Ordinary Portland Cement",
            "reason": "IS 8112:2013 was superseded and withdrawn; 33, 43, and 53 grades are now unified under IS 269:2015."
        },
        "IS 12269": {
            "current": "IS 269:2015",
            "name": "53 Grade Ordinary Portland Cement",
            "reason": "IS 12269:2013 was superseded and withdrawn into IS 269:2015."
        },
        "IS 456:1978": {
            "current": "IS 456:2000",
            "name": "Plain and Reinforced Concrete",
            "reason": "IS 456:1978 was superseded by the 2000 revision (reaffirmed 2021) incorporating limit state design."
        },
        "IS 1786:1985": {
            "current": "IS 1786:2008",
            "name": "High Strength Deformed Steel Bars (TMT)",
            "reason": "IS 1786:1985 is obsolete; IS 1786:2008 enforces modern Fe 500D ductility tolerances."
        },
        "IS 12615:2011": {
            "current": "IS 12615:2018",
            "name": "Line Operated 3-Phase AC Induction Motors",
            "reason": "IS 12615:2011 was replaced by the 2018 edition mandating IE2/IE3 international efficiency classes."
        },
        "IS 13252:2003": {
            "current": "IS 13252 (Part 1):2010",
            "name": "Information Technology Equipment - Safety",
            "reason": "IS 13252:2003 was superseded by the 2010 edition under MeitY Compulsory Registration Scheme (CRS)."
        },
        "IS 694:1990": {
            "current": "IS 694:2010",
            "name": "PVC Insulated Cables for Working Voltages up to 1100 V",
            "reason": "IS 694:1990 was superseded by the 2010 revision."
        },
        "IS 732:1989": {
            "current": "IS 732:2019",
            "name": "Code of Practice for Electrical Wiring Installations",
            "reason": "IS 732:1989 was thoroughly updated in the 2019 edition."
        },
        "IS 3043:1987": {
            "current": "IS 3043:2018",
            "name": "Code of Practice for Earthing",
            "reason": "IS 3043:1987 was replaced by the 2018 edition incorporating modern grounding architectures."
        }
    }

    # High-risk mandatory QCO commodities & category definitions
    MANDATORY_QCO_COMMODITIES = {
        "steel": {"standard": "IS 1786:2008", "qco": "Steel and Steel Products (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "CIVIL_STRUCTURAL", "tier": "TIER_1"},
        "rebar": {"standard": "IS 1786:2008", "qco": "Steel and Steel Products (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "CIVIL_STRUCTURAL", "tier": "TIER_1"},
        "tmt": {"standard": "IS 1786:2008", "qco": "Steel and Steel Products (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "CIVIL_STRUCTURAL", "tier": "TIER_1"},
        "cement": {"standard": "IS 269:2015 / IS 1489", "qco": "Cement (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "CIVIL_STRUCTURAL", "tier": "TIER_1"},
        "cable": {"standard": "IS 694 / IS 7098", "qco": "Electrical Wires and Cables (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "ELECTRICAL", "tier": "TIER_2"},
        "transformer": {"standard": "IS 1180 (Part 1):2014", "qco": "Distribution Transformers (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "ELECTRICAL", "tier": "TIER_1"},
        "motor": {"standard": "IS 12615:2018", "qco": "Electric Motors (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "ELECTROMECHANICAL", "tier": "TIER_2"},
        "cctv": {"standard": "IS 13252 (Part 1)", "qco": "Electronics & IT Goods (Compulsory Registration) Order", "scheme": "BIS CRS (Scheme II)", "domain": "IT_ELECTRONICS", "tier": "TIER_2"},
        "laptop": {"standard": "IS 13252 (Part 1)", "qco": "Electronics & IT Goods (Compulsory Registration) Order", "scheme": "BIS CRS (Scheme II)", "domain": "IT_ELECTRONICS", "tier": "TIER_2"},
        "led": {"standard": "IS 16102 / IS 15885", "qco": "LED Luminaires (Compulsory Registration) Order", "scheme": "BIS CRS (Scheme II)", "domain": "IT_ELECTRONICS", "tier": "TIER_2"},
        "gold": {"standard": "IS 1417", "qco": "Hallmarking of Gold Jewellery and Artefacts Order", "scheme": "Hallmarking (Scheme IV)", "domain": "CIVIL_STRUCTURAL", "tier": "TIER_1"},
        "fire extinguisher": {"standard": "IS 15683", "qco": "Fire Extinguishers (Quality Control) Order", "scheme": "ISI Mark (Scheme I)", "domain": "CIVIL_STRUCTURAL", "tier": "TIER_1"}
    }

    # Brand names frequently cited unfairly in tenders (CVC Red Flags)
    PROPRIETARY_BRANDS = [
        "tata", "tiscon", "sail", "jindal", "jsw", "vizag steel", "kamdhenu", "rathi",
        "ultratech", "ambuja", "acc", "shree cement", "dalmia", "jk cement",
        "havells", "polycab", "finolex", "kei", "rr kabel", "anchor",
        "siemens", "schneider", "abb", "l&t", "legrand", "ge",
        "kirloskar", "cummins", "crompton", "orient", "bajaj",
        "samsung", "apple", "hp", "dell", "lenovo", "cisco", "hikvision", "cp plus", "dahua"
    ]

    # Subjective/vague adjectives triggering Section 29 Contract Act ambiguity
    VAGUE_ADJECTIVES = [
        "best quality", "superior make", "heavy duty", "commercial grade",
        "first class", "reputed make", "durable quality", "good condition",
        "standard quality", "approved quality", "high grade material"
    ]

    def _determine_dynamic_capacities(self, matched_commodities: List[str]) -> Tuple[Dict[str, int], float, str]:
        """
        Dynamically adjusts dimension maximum capacities (summing to 100)
        and commodity sensitivity multiplier based on procurement scope.
        """
        if not matched_commodities:
            return {"gfr": 25, "cvc": 25, "cag": 25, "arbitration": 25}, 1.0, "TIER_3_GENERAL (1.0x Baseline)"

        primary_comm = matched_commodities[0]
        meta = self.MANDATORY_QCO_COMMODITIES[primary_comm]
        domain = meta.get("domain", "GENERAL")
        tier = meta.get("tier", "TIER_3")

        if domain == "CIVIL_STRUCTURAL":
            # In structural works, CAG QCO compliance and GFR 144(i) carry the highest legal consequence
            capacities = {"gfr": 30, "cvc": 25, "cag": 30, "arbitration": 20}
            multiplier = 1.25 if tier == "TIER_1" else 1.15
            label = f"{tier}_STRUCTURAL_SAFETY ({multiplier}x Multiplier)"
        elif domain == "IT_ELECTRONICS":
            # In IT tenders, CVC brand-tailoring (OEM lock-in) is the most rampant dispute trigger
            capacities = {"gfr": 20, "cvc": 35, "cag": 30, "arbitration": 20}
            multiplier = 1.15
            label = f"{tier}_IT_ELECTRONICS_CRS ({multiplier}x Multiplier)"
        elif domain in ["ELECTRICAL", "ELECTROMECHANICAL"]:
            # Electrical tenders suffer heavily from arbitration traps (ratings, test certificates) and QCOs
            capacities = {"gfr": 25, "cvc": 25, "cag": 30, "arbitration": 25}
            multiplier = 1.20 if tier == "TIER_1" else 1.10
            label = f"{tier}_ELECTRO_TECHNICAL ({multiplier}x Multiplier)"
        else:
            capacities = {"gfr": 25, "cvc": 25, "cag": 25, "arbitration": 25}
            multiplier = 1.0
            label = "TIER_3_GENERAL (1.0x Baseline)"

        return capacities, multiplier, label

    def audit_tender(
        self,
        tender_text: Optional[str] = None,
        clauses: Optional[List[str]] = None,
        target_standard: Optional[str] = None
    ) -> DisputeRiskReport:
        """
        Executes a comprehensive 4-dimension audit with dynamic point distribution.
        """
        combined_text = ""
        clause_list = []

        if clauses:
            clause_list.extend(clauses)
            combined_text += "\n".join(clauses)
        if tender_text:
            combined_text += "\n" + tender_text
            if not clause_list:
                clause_list = [c.strip() for c in re.split(r'[\r\n]+|[;\.]\s+', tender_text) if len(c.strip()) > 8]

        text_lower = combined_text.lower()
        findings: List[AuditVulnerabilityFinding] = []

        # Detect commodities & determine dynamic capacities
        matched_commodities = [c for c in self.MANDATORY_QCO_COMMODITIES if c in text_lower]
        max_scores, multiplier, criticality_label = self._determine_dynamic_capacities(matched_commodities)

        dim_scores = {
            "gfr": 0,
            "cvc": 0,
            "cag": 0,
            "arbitration": 0
        }

        # -------------------------------------------------------------------------
        # Dimension 1: GFR 2017 Rule 144(i) (Standardization & Generic Specifications)
        # -------------------------------------------------------------------------
        has_is_citation = bool(re.search(r'\bIS\s*[:\-\s]?\s*\d{2,5}\b', combined_text, re.IGNORECASE))
        has_foreign_std = bool(re.search(r'\b(ASTM|DIN|EN|BS|ISO|IEC)\s*[A-Z0-9\-\.]+\b', combined_text, re.IGNORECASE))

        if matched_commodities and not has_is_citation:
            finding_id = f"gfr-{uuid.uuid4().hex[:6]}"
            # Dynamic calculation based on commodity criticality
            points = min(max_scores["gfr"], round(22 * multiplier))
            dim_scores["gfr"] += points
            findings.append(AuditVulnerabilityFinding(
                id=finding_id,
                dimension="GFR_144_I",
                dimension_title="GFR 2017 Rule 144(i) Compliance",
                severity="CRITICAL",
                clause_text=clause_list[0] if clause_list else combined_text[:120],
                rule_reference="General Financial Rules (GFR) 2017 Rule 144(i) & Manual for Procurement §2.1.1",
                issue="Tender procures standardized engineering commodity without citing official Indian Standards (IS).",
                consequence="Tender is ultra vires to GFR Rule 144(i). High risk of audit rejection by IFA and delivery of non-standard counterfeit material.",
                remediation=f"Mandate relevant Indian Standard (e.g., {self.MANDATORY_QCO_COMMODITIES[matched_commodities[0]]['standard']}) as the primary technical specification benchmark.",
                risk_points=points
            ))
        elif has_foreign_std and not has_is_citation:
            finding_id = f"gfr-{uuid.uuid4().hex[:6]}"
            points = min(max_scores["gfr"], round(16 * multiplier))
            dim_scores["gfr"] += points
            findings.append(AuditVulnerabilityFinding(
                id=finding_id,
                dimension="GFR_144_I",
                dimension_title="GFR 2017 Rule 144(i) Compliance",
                severity="HIGH",
                clause_text=self._find_matching_clause(clause_list, r'\b(ASTM|DIN|EN|BS)\b') or "Foreign standard reference",
                rule_reference="GFR 2017 Rule 144(i) & DPIIT Public Procurement Guidelines",
                issue="Foreign standard (ASTM/DIN/BS) cited as sole standard without incorporating Indian Standard equivalent or ministry exemption.",
                consequence="Potential dispute regarding local supplier disqualification and audit objection for bypassing published national standards.",
                remediation="Cite the Indian Standard equivalent (e.g. 'conforming to IS ... or international equivalent') with explicit parity criteria.",
                risk_points=points
            ))

        # -------------------------------------------------------------------------
        # Dimension 2: CVC Anti-Competitive & Restrictive Brand-Tailoring Guidelines
        # -------------------------------------------------------------------------
        brand_hits = []
        for brand in self.PROPRIETARY_BRANDS:
            if re.search(r'\b' + re.escape(brand) + r'\b', text_lower):
                brand_hits.append(brand)

        if brand_hits:
            has_or_equivalent = bool(re.search(r'\bor\s+equivalent\b|\bor\s+equal\b|\bor\s+similar\b', text_lower))
            has_restrictive_only = bool(re.search(r'\bonly\b|\bexclusive\b|\bsole\b|\bpreferred\b', text_lower))

            if not has_or_equivalent or has_restrictive_only:
                finding_id = f"cvc-{uuid.uuid4().hex[:6]}"
                # Scale dynamically with number of brands and restrictive intensity
                base_cvc = 20 if not has_restrictive_only else 23
                extra_brands = max(0, len(brand_hits) - 1) * 2
                points = min(max_scores["cvc"], round((base_cvc + extra_brands) * (multiplier if "IT" in criticality_label else 1.0)))
                dim_scores["cvc"] += points
                clause_snippet = self._find_matching_clause(clause_list, brand_hits[0]) or f"Make: {brand_hits[0].capitalize()}"
                findings.append(AuditVulnerabilityFinding(
                    id=finding_id,
                    dimension="CVC_COMPETITION",
                    dimension_title="CVC Anti-Competitive & Restrictive Guidelines",
                    severity="CRITICAL" if has_restrictive_only else "HIGH",
                    clause_text=clause_snippet,
                    rule_reference="Central Vigilance Commission (CVC) Order No. 005/CRD/19 & GFR Rule 144(iii)",
                    issue=f"Proprietary brand name(s) cited ('{', '.join([b.capitalize() for b in brand_hits[:3]])}') without unrestricted 'or equivalent' criteria.",
                    consequence="Violates CVC transparency directives against restrictive brand-tailoring. High risk of pre-bid litigation and tender quashing.",
                    remediation="Delete proprietary brand names. Replace with objective functional performance criteria and BIS standard grade parameters.",
                    risk_points=points
                ))
            else:
                points = min(max_scores["cvc"], round(8 + min(6, len(brand_hits) * 2)))
                dim_scores["cvc"] += points
                findings.append(AuditVulnerabilityFinding(
                    id=f"cvc-{uuid.uuid4().hex[:6]}",
                    dimension="CVC_COMPETITION",
                    dimension_title="CVC Anti-Competitive & Restrictive Guidelines",
                    severity="MEDIUM",
                    clause_text=self._find_matching_clause(clause_list, brand_hits[0]) or "Brand list with equivalent",
                    rule_reference="CVC Office Order 02-02-04 & Manual for Procurement of Goods 2024",
                    issue="Tender mentions indicative brand names. While 'or equivalent' is noted, listing preferred makes can dissuade competitive bidding.",
                    consequence="Potential complaints from emerging MSME manufacturers during pre-bid queries.",
                    remediation="Prefer pure technical parameter specifications conforming to BIS without mentioning specific corporate brand lists.",
                    risk_points=points
                ))

        # -------------------------------------------------------------------------
        # Dimension 3: CAG Compliance Audit Vulnerabilities (Superseded Standards & QCOs)
        # -------------------------------------------------------------------------
        # Check superseded standards
        superseded_count = 0
        for obsolete_code, meta in self.SUPERSEDED_CATALOG.items():
            pattern = re.escape(obsolete_code).replace(r'\ ', r'\s*')
            if re.search(r'\b' + pattern + r'\b', combined_text, re.IGNORECASE):
                superseded_count += 1
                finding_id = f"cag-{uuid.uuid4().hex[:6]}"
                points = min(max_scores["cag"] - dim_scores["cag"], round(20 * multiplier) if superseded_count == 1 else round(6 * multiplier))
                dim_scores["cag"] += points
                clause_snippet = self._find_matching_clause(clause_list, obsolete_code) or f"Reference to {obsolete_code}"
                findings.append(AuditVulnerabilityFinding(
                    id=finding_id,
                    dimension="CAG_AUDIT",
                    dimension_title="CAG Compliance Audit Vulnerability",
                    severity="HIGH",
                    clause_text=clause_snippet,
                    rule_reference="CAG Compliance Audit Guidelines & BIS Standardization Directives",
                    issue=f"Cited standard '{obsolete_code}' is SUPERSEDED/WITHDRAWN by BIS.",
                    consequence=f"Audit objection by Comptroller and Auditor General (CAG) regarding expenditure governed by obsolete technical metrics ({meta['reason']}).",
                    remediation=f"Replace '{obsolete_code}' with the current active edition '{meta['current']}'.",
                    risk_points=points
                ))

        # Check mandatory Gazette QCO orders
        for commodity, qco_data in self.MANDATORY_QCO_COMMODITIES.items():
            if commodity in text_lower:
                has_qco_mention = bool(re.search(r'\b(isi\s*mark|bis\s*license|qco|quality\s*control\s*order|crs|hallmark|mandatory\s*bis)\b', text_lower))
                if not has_qco_mention:
                    finding_id = f"cag-qco-{uuid.uuid4().hex[:6]}"
                    points = min(max_scores["cag"] - dim_scores["cag"], round(18 * multiplier))
                    dim_scores["cag"] += points
                    findings.append(AuditVulnerabilityFinding(
                        id=finding_id,
                        dimension="CAG_AUDIT",
                        dimension_title="CAG Compliance Audit Vulnerability",
                        severity="HIGH",
                        clause_text=self._find_matching_clause(clause_list, commodity) or f"Procurement of {commodity}",
                        rule_reference=f"Section 16 of BIS Act 2016 & {qco_data['qco']}",
                        issue=f"Product falls under statutory Central Govt Quality Control Order, but tender omits mandatory {qco_data['scheme']} certification requirement.",
                        consequence="Statutory violation of e-Gazette QCO order. Public procurement officials are legally prohibited from procuring non-certified stock.",
                        remediation=f"Mandate that all supplied material must possess valid {qco_data['scheme']} under {qco_data['qco']}.",
                        risk_points=points
                    ))
                    break

        # -------------------------------------------------------------------------
        # Dimension 4: Arbitration Traps & Contract Ambiguity (Section 29 Contract Act)
        # -------------------------------------------------------------------------
        # Check vague adjectives
        found_vague = [adj for adj in self.VAGUE_ADJECTIVES if adj in text_lower]
        if found_vague:
            finding_id = f"arb-{uuid.uuid4().hex[:6]}"
            points = min(max_scores["arbitration"] - dim_scores["arbitration"], min(12, 6 + len(found_vague) * 2))
            dim_scores["arbitration"] += points
            clause_snippet = self._find_matching_clause(clause_list, found_vague[0]) or f"Uses term '{found_vague[0]}'"
            findings.append(AuditVulnerabilityFinding(
                id=finding_id,
                dimension="ARBITRATION_TRAP",
                dimension_title="Arbitration Trap & Contract Ambiguity",
                severity="MEDIUM",
                clause_text=clause_snippet,
                rule_reference="Indian Contract Act 1872 Section 29 (Agreements void for uncertainty)",
                issue=f"Subjective/ambiguous descriptor ('{found_vague[0]}') used without quantifiable technical acceptance criteria.",
                consequence="Subjective wording cannot be legally defended during disputes or material rejection, leading to vendor arbitration claims.",
                remediation=f"Eliminate '{found_vague[0]}'. Replace with exact numerical tolerances, dimensions, or chemical/physical limits specified in relevant IS code.",
                risk_points=points
            ))

        # Check missing test / inspection agency
        has_testing_clause = bool(re.search(r'\b(test\s*certificate|inspection|nabl|sampling|manufacturer\s*test\s*certificate|mtc|third\s*party|is\s*1608|is\s*10810|is\s*4031)\b', text_lower))
        if len(clause_list) > 1 and not has_testing_clause and matched_commodities:
            finding_id = f"arb-test-{uuid.uuid4().hex[:6]}"
            points = min(max_scores["arbitration"] - dim_scores["arbitration"], round(12 * multiplier))
            dim_scores["arbitration"] += points
            findings.append(AuditVulnerabilityFinding(
                id=finding_id,
                dimension="ARBITRATION_TRAP",
                dimension_title="Arbitration Trap & Contract Ambiguity",
                severity="MEDIUM",
                clause_text=clause_list[-1] if clause_list else combined_text[:100],
                rule_reference="Manual for Procurement of Goods 2024 §7.1 (Inspection & Testing Protocols)",
                issue="Missing inspection protocol, sampling frequency, or NABL laboratory testing requirements.",
                consequence="Tender lacks legal mechanism to inspect or reject sub-standard lots upon delivery, creating an arbitration vulnerability.",
                remediation="Specify: 'Manufacturer Test Certificate (MTC) as per relevant IS must accompany each consignment, with pre-dispatch sampling by NABL-accredited laboratory.'",
                risk_points=points
            ))

        # Check conflicting values
        if "415v" in text_lower and "230v" in text_lower:
            points = min(max_scores["arbitration"] - dim_scores["arbitration"], 18)
            dim_scores["arbitration"] += points
            findings.append(AuditVulnerabilityFinding(
                id=f"arb-conflict-{uuid.uuid4().hex[:6]}",
                dimension="ARBITRATION_TRAP",
                dimension_title="Arbitration Trap & Contract Ambiguity",
                severity="CRITICAL",
                clause_text="Tender cites both 415 V (3-phase) and 230 V (1-phase) operating ratings",
                rule_reference="Indian Contract Act §29 & CPWD General Specifications §3.2",
                issue="Contradictory electrical voltage requirements detected in tender document.",
                consequence="Fatal ambiguity leading to contractor claims, varied scope disputes, or installation failures.",
                remediation="Clearly segregate 3-phase (415 V) power circuits from single-phase (230 V) control/auxiliary circuits.",
                risk_points=points
            ))

        # Bound each dimension score by its dynamic ceiling
        for k in dim_scores:
            dim_scores[k] = min(dim_scores[k], max_scores[k])

        total_risk_score = min(100, sum(dim_scores.values()))

        # Determine risk tier
        if total_risk_score <= 20:
            risk_tier = "SAFE"
            summary = "Tender exhibits pristine statutory compliance with GFR Rule 144(i), CVC guidelines, and BIS mandatory QCO directives."
        elif total_risk_score <= 40:
            risk_tier = "LOW"
            summary = "Low dispute risk. Minor formatting or non-blocking technical refinements suggested to fortify inspection clauses."
        elif total_risk_score <= 65:
            risk_tier = "MODERATE"
            summary = "Moderate dispute vulnerability. Omissions in testing protocols, ambiguous terminology, or indicative brand names require revision."
        elif total_risk_score <= 85:
            risk_tier = "HIGH"
            summary = "High risk of CAG audit objections or CVC inquiry due to restrictive brand tailoring, superseded standards, or missing mandatory QCOs."
        else:
            risk_tier = "CRITICAL"
            summary = "Critical statutory hazard. Violates GFR 2017 Rule 144(i) and Central Vigilance directives. High probability of tender cancellation or arbitration."

        # Generate remediated specification
        remediated_spec = self._generate_remediated_text(combined_text, findings, matched_commodities)

        report = DisputeRiskReport(
            total_risk_score=total_risk_score,
            risk_tier=risk_tier,
            summary=summary,
            dimension_scores=dim_scores,
            dimension_max_scores=max_scores,
            commodity_criticality=criticality_label,
            findings=findings,
            remediated_specification=remediated_spec,
            compliance_certificate_id=f"GFR-AUDIT-{uuid.uuid4().hex[:8].upper()}"
        )

        return report

    def _find_matching_clause(self, clauses: List[str], pattern: str) -> Optional[str]:
        for c in clauses:
            if re.search(r'\b' + pattern + r'\b', c, re.IGNORECASE):
                return c.strip()
        return None

    def _generate_remediated_text(
        self,
        original_text: str,
        findings: List[AuditVulnerabilityFinding],
        matched_commodities: List[str]
    ) -> str:
        """
        Creates a legally robust, GFR 2017 & CVC compliant clause.
        """
        remediated = original_text.strip()

        # 1. Clean brand names
        for brand in self.PROPRIETARY_BRANDS:
            remediated = re.sub(
                rf'\b(?:make|brand|oem)?\s*[:\-]?\s*{re.escape(brand)}\b(?:\s*only)?',
                'reputed manufacturer conforming to relevant Indian Standard',
                remediated,
                flags=re.IGNORECASE
            )

        # 2. Fix superseded standards
        for obsolete, meta in self.SUPERSEDED_CATALOG.items():
            remediated = re.sub(
                re.escape(obsolete),
                f"{meta['current']} (superseding {obsolete})",
                remediated,
                flags=re.IGNORECASE
            )

        # 3. Clean vague adjectives
        for adj in self.VAGUE_ADJECTIVES:
            remediated = re.sub(
                rf'\b{re.escape(adj)}\b',
                'first-grade quality meeting specified dimensional and mechanical tolerances',
                remediated,
                flags=re.IGNORECASE
            )

        # 4. Append mandatory QCO & Testing clause if missing
        if matched_commodities:
            primary_comm = matched_commodities[0]
            comm_meta = self.MANDATORY_QCO_COMMODITIES[primary_comm]
            appendices = [
                f"\n\n[MANDATORY STATUTORY COMPLIANCE]: All supplied items shall strictly conform to {comm_meta['standard']} and carry valid {comm_meta['scheme']} certification in compliance with the {comm_meta['qco']} issued by the Government of India.",
                "Inspection & Testing: Consignments must be accompanied by Manufacturer Test Certificates (MTC). Third-party sampling shall be conducted at a NABL-accredited laboratory prior to formal acceptance as per GFR 2017 Rule 144."
            ]
            remediated += " ".join(appendices)

        return remediated
