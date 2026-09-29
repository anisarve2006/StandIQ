"""
Universal Procurement Archetype Classifier.
Architecture Layer: Pre-Retrieval Information-Theoretic Density & Archetype Sieve.

Categorizes any public procurement / tender / BoQ clause into one of four archetypes:
1. PHYSICAL_PRODUCT: Tangible manufactured goods, civil materials, electrical/mechanical equipment.
   -> Routes into 12-layer Standards Recommendation Engine (IS/ISO, QCO verification).
2. SERVICE_RATE_SLAB: Pure numeric ranges, distance tiers, weight brackets, or tariff slabs (e.g. '0-15 Km flat', '101-150 Km', 'Tier 2').
   -> Deterministic Non-Product Advisory. No physical standard exists.
3. FINANCIAL_ADJUSTMENT: Demolition scrap credits, salvage values, disposal of malba/rubbish, fees, EMD, taxes.
   -> Deterministic Accounting Advisory. No physical standard exists.
4. SERVICE_OR_LABOUR: Operational contracts, transportation, handling, manpower, maintenance (AMC), housekeeping.
   -> Routes to Quality Management (IS/ISO 9001) or Safety in Operations (e.g. IS 14881), preventing accidental product standard hallucinations.
"""

import re
from typing import Dict, Any, Optional

class ProcurementArchetypeClassifier:
    def __init__(self):
        # 1. Pure Distance / Metric / Tariff Slabs Regex Patterns
        self.slab_patterns = [
            # e.g. "0-15 Km", "16-25 km", "101 - 150 Km", "76- 100 Km", "201 - Above Km", "upto 15 km"
            r'^(?:(?:sl\.?\s*no\.?|\d+[\.\)]?)\s*)?\d+(?:\.\d+)?\s*(?:-|to)\s*(?:\d+(?:\.\d+)?|above)\s*(?:km|kms|kilometres?|miles?|mt|tonnes?|kg|litres?|mtrs?)(?:\s*(?:flat|lead|rate|slab|basis))?$',
            r'^(?:(?:sl\.?\s*no\.?|\d+[\.\)]?)\s*)?\d+(?:\.\d+)?\s*(?:km|kms|kilometres?)\s*(?:flat|lead|rate)?$',
            r'^(?:rate\s+for\s+)?transportation\s+slab\s*[:\-\d]',
            r'^(?:distance|lead)\s*(?:of\s*)?(?:upto|from|between)?\s*\d+\s*(?:-|to)\s*\d+\s*(?:km|kms|metres?)\b'
        ]

        # 2. Accounting, Scrap, Demolition, Fee, and Balance Adjustments
        self.financial_scrap_terms = [
            "credit of dismantled", "credit for dismantled", "scrap credit", "salvage value",
            "disposal of building rubbish", "disposal of malba", "disposal of waste material",
            "dismantled material credit", "unserviceable dismantled material",
            "tender fee", "earnest money", "emd amount", "emd fee", "security deposit",
            "performance guarantee", "gst correction", "cost index", "rebate", "discount offered",
            "impact of gst", "impact of taxes", "purpose of ctc", "for the purpose of ctc", "total impact of gst"
        ]

        # 2b. Contractual Conditions, GCC/SCC clauses, Legal Terms
        self.contractual_terms = [
            "general conditions of contract", "special conditions of contract", "gcc clause", "scc clause",
            "qualifying requirements", "pre-qualification criteria", "pqc", "payment terms", "defect liability",
            "governing laws", "effective date gcc", "amendments of, and supplements to",
            "rate contracts shall be awarded", "lowest received price", "price adjustment",
            "force majeure", "liquidated damages", "termination of contract", "schedule of price bid",
            "instructions to bidders", "model rules",
            "two-bid system", "technical bid", "commercial bid", "selection process", "eligibility criteria",
            "validity of offer", "important documents to be submitted", "sales tax clearance", "it clearance certificate",
            "resolution of disputes", "jurisdiction all questions", "courts of delhi", "annexure - vi commercial bid",
            "contact official", "email:"
        ]

        # 3. Operational Services, Labour, Statutory Licensing & Site Preparation
        self.service_operational_terms = [
            "rake handling", "rake handling charges", "handling charges",
            "unloading from wagons", "stacking on platform", "de-stacking from platform",
            "loading into trucks", "unloading from trucks", "stacking at godown",
            "loading of fertilizers", "unloading at godowns", "unloading at markfed",
            "storage charges", "demurrage charges", "wharfage charges", "standardisation charges",
            "rate for transportation of material", "transportation of bagged",
            "watch and ward services", "security services", "housekeeping services",
            "sanitation services", "cleaning services", "sweeping services",
            "manpower supply", "data entry services", "annual maintenance contract",
            "comprehensive maintenance contract", "operation and maintenance", "o&m services",
            "courier services", "catering services", "hiring of vehicles",
            "consultancy and obtaining", "cost of consultancy", "consultancy",
            "obtaining five-year license", "obtaining license", "license from peso",
            "peso compliant", "peso license", "modifications of the available site",
            "modifications of available site", "storage and dispensing facility",
            "dispensing facility", "site modification", "site preparation",
            "statutory approval", "statutory clearance", "consent to operate",
            "ceig approval", "factory license", "boiler inspection"
        ]

        # 3b. Civil Demolition & Dismantling Terms
        self.demolition_terms = [
            "demolishing brick work", "demolishing brickwork", "demolishing concrete", "demolishing rcc",
            "demolition of brick", "demolition of concrete", "demolishing stone masonry",
            "dismantling brick work", "dismantling tile work", "dismantling doors", "dismantling steel work",
            "demolishing brick", "demolition of", "dismantling of", "demolishing", "dismantling"
        ]

        # 4. Tangible Manufacturing / Material Nouns (Entity Positive Check)
        self.physical_product_nouns = [
            "pipe", "pipes", "fitting", "fittings", "tile", "tiles", "valve", "valves",
            "cement", "concrete", "brick", "bricks", "steel", "bar", "bars", "rebar",
            "cable", "cables", "wire", "wires", "conductor", "conductors",
            "switchgear", "transformer", "transformer", "motor", "motors", "pump", "pumps",
            "basin", "basins", "closet", "cistern", "sink", "sinks", "trap", "door", "doors",
            "shutter", "shutters", "handle", "handles", "stay", "stays", "bolt", "bolts",
            "stopper", "lock", "locks", "glass", "sheet", "sheets", "primer", "paint", "paints",
            "enamel", "distemper", "plaster", "putty", "limestone", "marble", "granite",
            "timber", "plywood", "particle board", "insulator", "battery", "batteries",
            "solar panel", "module", "lamp", "luminaire", "bulb", "meter", "meters",
            "fire extinguisher", "shoe", "shoes", "footwear", "helmet", "gloves", "mask", "masks",
            "fertilizer", "urea", "cylinder", "cylinders", "bearing", "bearings"
        ]

    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classifies input text into one of 4 archetypes with high information-theoretic precision:
        - PHYSICAL_PRODUCT
        - SERVICE_RATE_SLAB
        - FINANCIAL_ADJUSTMENT
        - SERVICE_OR_LABOUR
        """
        raw = text.strip()
        lower = raw.lower()

        # Clean punctuation and leading item numbers (do NOT strip numbers from ranges like 0-15 or 16-25)
        clean = re.sub(r'^(?:item|sl\.?\s*no\.?)\s*(?:\d+(?:\.\d+)?[\.:\)]\s*)?', '', lower, flags=re.IGNORECASE)
        clean = re.sub(r'^\d+(?:\.\d+)?[\.:\)]\s+', '', clean, flags=re.IGNORECASE).strip()

        # Rule 1: Check for Pure Distance / Rate Slabs
        for pat in self.slab_patterns:
            if re.search(pat, clean, re.IGNORECASE):
                return {
                    "archetype": "SERVICE_RATE_SLAB",
                    "is_physical_product": False,
                    "category": "Logistics & Freight Rate Slab",
                    "standard_applicable": False,
                    "recommended_action": "EXCLUDE_FROM_PRODUCT_STANDARDS",
                    "explanation": f"Line item '{raw}' specifies a distance or tariff pricing slab (e.g. freight tier). It represents a commercial rate parameter rather than a manufactured physical product. No Indian Standards (BIS/QCO) apply."
                }

        # Sub-check: If query has NO words except a number and distance unit (e.g., "76- 100 Km", "101 - 150 Km", "0-15 Km flat")
        tokens = clean.split()
        is_all_numeric_or_unit = all(
            re.match(r'^\d+(?:\.\d+)?$', t) or t in ["-", "to", "km", "kms", "flat", "above", "mt", "upto", "lead", "slab"]
            for t in tokens
        )
        if is_all_numeric_or_unit and any(u in tokens for u in ["km", "kms", "flat", "above"]):
            return {
                "archetype": "SERVICE_RATE_SLAB",
                "is_physical_product": False,
                "category": "Logistics & Freight Rate Slab",
                "standard_applicable": False,
                "recommended_action": "EXCLUDE_FROM_PRODUCT_STANDARDS",
                "explanation": f"Line item '{raw}' is a transport distance bracket. No manufacturing BIS product standard applies."
            }

        # Rule 2: Check for Financial Adjustments / Scrap Credit / Demolition Waste
        for term in self.financial_scrap_terms:
            if term in clean:
                return {
                    "archetype": "FINANCIAL_ADJUSTMENT",
                    "is_physical_product": False,
                    "category": "Financial / Scrap Credit / Disposal Adjustment",
                    "standard_applicable": False,
                    "recommended_action": "EXCLUDE_FROM_PRODUCT_STANDARDS",
                    "explanation": f"Clause '{raw}' represents an accounting credit, scrap salvage adjustment, or demolition waste disposal entry. No BIS product standard applies."
                }

        # Rule 2b: Check for Contractual Conditions / GCC / SCC / Legal Terms
        for term in self.contractual_terms:
            if term in clean:
                return {
                    "archetype": "CONTRACTUAL_CONDITION",
                    "is_physical_product": False,
                    "category": "Contractual / Legal / Qualification Condition",
                    "standard_applicable": False,
                    "recommended_action": "EXCLUDE_FROM_PRODUCT_STANDARDS",
                    "explanation": f"Clause '{raw}' is a contractual condition, legal rule, or bidder qualification requirement. No BIS product standard applies."
                }

        # Rule 2c: Check for Demolition & Dismantling Works
        # Guard: If clause starts with "providing and fixing/laying" a physical product, dismantling is incidental
        has_supply_fixing = any(clean.startswith(pfx) for pfx in ["providing and fixing", "providing & fixing", "supply and fixing", "providing and laying", "providing & laying"])
        has_physical_noun = any(re.search(rf'\b{re.escape(noun)}\b', clean) for noun in self.physical_product_nouns)

        if not (has_supply_fixing and has_physical_noun):
            for term in self.demolition_terms:
                if term in clean:
                    return {
                        "archetype": "SERVICE_OR_LABOUR",
                        "is_physical_product": False,
                        "category": "Civil Demolition & Dismantling Work",
                        "standard_applicable": True,
                        "service_standard": {
                            "family_id": "IS:4130",
                            "raw_id": "IS 4130",
                            "title_en": "Safety code for demolition of buildings",
                            "status": "CURRENT",
                            "is_mandatory": False,
                            "type": "SAFETY_CODE"
                        },
                        "recommended_action": "APPLY_DEMOLITION_SAFETY_CODE",
                        "explanation": f"Clause '{raw}' specifies civil demolition or dismantling work. Rather than a manufactured product standard, this execution is governed by IS 4130 (Safety code for demolition of buildings) and statutory site safety protocols."
                    }

        # Rule 3: Check for Operational Services & Labour Contracts
        # If text explicitly describes service operations without supplying a manufactured product
        has_physical_noun = any(re.search(rf'\b{re.escape(noun)}\b', clean) for noun in self.physical_product_nouns)
        
        for term in self.service_operational_terms:
            if term in clean:
                # If it's a pure service without a physical product being procured
                if not has_physical_noun or any(k in clean for k in ["handling and transportation", "rake handling", "unloading from", "watch and ward"]):
                    return {
                        "archetype": "SERVICE_OR_LABOUR",
                        "is_physical_product": False,
                        "category": "Operational / Logistics / Manpower Service",
                        "standard_applicable": True,
                        "service_standard": {
                            "family_id": "IS/ISO:9001",
                            "raw_id": "IS/ISO 9001 : 2015",
                            "title_en": "Quality Management Systems - Requirements (Applicable to Service Providers)",
                            "status": "CURRENT",
                            "is_mandatory": False,
                            "type": "SERVICE_QUALITY_STANDARD"
                        },
                        "recommended_action": "APPLY_SERVICE_QUALITY_CODE",
                        "explanation": f"Clause '{raw}' is an operational service contract (Handling / Logistics / Manpower). Manufacturing product standards are not applicable. Recommended service governance standard is IS/ISO 9001 (Quality Management Systems) and relevant statutory safety codes."
                    }

        # Rule 4: Physical Manufactured Product
        return {
            "archetype": "PHYSICAL_PRODUCT",
            "is_physical_product": True,
            "category": "Manufactured Product / Engineering Material",
            "standard_applicable": True,
            "recommended_action": "RUN_STANDARDS_RECOMMENDATION_PIPELINE",
            "explanation": "Tangible manufactured good or engineering material. Subject to BIS Indian Standards and Central Government QCO regulations."
        }

# Global singleton
archetype_classifier = ProcurementArchetypeClassifier()
