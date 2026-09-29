import re
from typing import Dict, Any, List, Optional
from schemas.api import CompletenessResponse, ClarifyResponse, ClarificationQuestion
from retrieval.compiler import compile_query

class CompletenessService:
    def get_completeness_report(self, coverage_info: Dict[str, Any], constraints: Dict[str, Any]) -> CompletenessResponse:
        covered = []
        missing = []
        partial = []
        
        facets = coverage_info.get("facets", {})
        for k, v in facets.items():
            if v:
                covered.append(k.upper())
            else:
                missing.append(k.upper())
                
        questions = []
        
        # Clarifying questions based on missing requirements/constraints
        if "environment" not in constraints:
            questions.append("What operating temperature range and environment (indoor/outdoor) should the equipment support?")
        if "voltage" not in constraints:
            questions.append("What operating voltage is required for the installation?")
        if "power" not in constraints:
            questions.append("What is the required power rating (e.g., kW, HP)?")
        if "grade" not in constraints:
            questions.append("What material grade is required?")
            
        return CompletenessResponse(
            covered=covered,
            partial=partial,
            missing=missing,
            clarifying_questions=questions
        )

    def clarify_query(self, query: str, context: Optional[Dict[str, Any]] = None) -> ClarifyResponse:
        """Analyzes a user query for engineering ambiguity and returns actionable clarifying questions
        with selectable chip options (e.g. kVA rating, voltage, diameter, grade).
        """
        compiled = compile_query(query)
        clean_text = (compiled.get("canonical_english") or query).lower()
        extracted_constraints = compiled.get("constraints") or {}
        num_units = compiled.get("numbers_and_units") or []

        q_list: List[ClarificationQuestion] = []
        candidates: List[str] = []
        detected_prod: Optional[str] = None
        detected_div: Optional[str] = None

        has_voltage = "voltage" in extracted_constraints or any(u.get("unit") in ["V", "kV"] for u in num_units) or bool(re.search(r'\b(11\s*kv|33\s*kv|415\s*v|230\s*v|440\s*v)\b', clean_text))
        has_power = "power" in extracted_constraints or any(u.get("unit") in ["kW", "HP", "kVA", "MVA", "W"] for u in num_units) or bool(re.search(r'\b(\d+\s*kva|\d+\s*kw|\d+\s*hp|\d+\s*mva)\b', clean_text))
        has_diameter = "nominal_diameter" in extracted_constraints or any(u.get("unit") in ["mm", "inch"] for u in num_units) or bool(re.search(r'\b(\d+\s*mm|\d+\s*inch)\b', clean_text))
        has_grade = "grade" in extracted_constraints or bool(re.search(r'\b(fe\s*\d+|grade\s*\d+|m\d+|e\s*\d+)\b', clean_text))

        # 1. Transformers
        if any(w in clean_text for w in ["transformer", "xfr", "step down", "step-down"]):
            detected_prod = "Distribution / Power Transformer"
            detected_div = "Electrotechnical (ETD 16)"
            candidates = ["IS 1180 (Part 1) : 2014", "IS 2026", "IS 11171"]
            
            if not has_power:
                q_list.append(ClarificationQuestion(
                    parameter="kVA Rating",
                    question="What is the rated capacity (kVA) of the transformer?",
                    options=["25 kVA", "63 kVA", "100 kVA", "250 kVA", "500 kVA", "1000 kVA"],
                    required_for="Differentiates standard distribution ratings under IS 1180 Part 1."
                ))
            if not has_voltage:
                q_list.append(ClarificationQuestion(
                    parameter="Primary Voltage",
                    question="What is the primary operational voltage?",
                    options=["11 kV", "22 kV", "33 kV"],
                    required_for="Determines insulation class and high-voltage bushing requirements."
                ))
            if not any(w in clean_text for w in ["oil", "dry", "onan", "cast resin"]):
                q_list.append(ClarificationQuestion(
                    parameter="Cooling Method",
                    question="What cooling medium is specified?",
                    options=["Oil-immersed Naturally Cooled (ONAN)", "Dry-Type / Cast Resin (IS 11171)"],
                    required_for="Resolves oil-immersed IS 1180 vs dry-type indoor transformer standards."
                ))

        # 2. Steel Rebar / TMT / Sariya
        elif any(w in clean_text for w in ["rebar", "tmt", "sariya", "reinforcement bar", "deformed steel"]):
            detected_prod = "High Strength Deformed Steel Bars (TMT)"
            detected_div = "Civil Engineering (CED 54)"
            candidates = ["IS 1786 : 2008", "IS 432", "IS 2062"]

            if not has_grade:
                q_list.append(ClarificationQuestion(
                    parameter="Steel Strength Grade",
                    question="What steel strength grade is required for reinforcement?",
                    options=["Fe 500D (High Ductility / Seismic)", "Fe 500", "Fe 550D", "Fe 600"],
                    required_for="Ensures compliance with Mandatory Steel QCO and seismic provisions of IS 13920."
                ))
            if not has_diameter:
                q_list.append(ClarificationQuestion(
                    parameter="Nominal Diameter",
                    question="What nominal bar diameter is needed?",
                    options=["8 mm", "10 mm", "12 mm", "16 mm", "20 mm", "25 mm", "32 mm"],
                    required_for="Specifies exact rolling tolerances and mass per meter requirements under IS 1786."
                ))

        # 3. Cement
        elif any(w in clean_text for w in ["cement", "portland", "opc", "ppc"]):
            detected_prod = "Portland Cement"
            detected_div = "Civil Engineering (CED 2)"
            candidates = ["IS 269 : 2015", "IS 1489 (Part 1) : 2015", "IS 455 : 2015"]

            if not any(w in clean_text for w in ["43", "53", "ppc", "slag", "pozzolana"]):
                q_list.append(ClarificationQuestion(
                    parameter="Cement Type & Grade",
                    question="Which type and grade of cement is required?",
                    options=["Ordinary Portland Cement 43 Grade (IS 269)", "Ordinary Portland Cement 53 Grade (IS 269)", 
                             "Portland Pozzolana Cement - Flyash based (IS 1489 Pt 1)", "Portland Slag Cement (IS 455)"],
                    required_for="Selects correct chemical compressive strength testing standard under Cement QCO."
                ))

        # 4. Steel Pipes & Tubes
        elif any(w in clean_text for w in ["pipe", "tube", "gi pipe", "ms tube", "erw tube", "conduit"]):
            detected_prod = "Steel Pipes & Tubes"
            detected_div = "Mechanical Engineering (MED 8)"
            candidates = ["IS 1239 (Part 1) : 2004", "IS 3589", "IS 1161", "IS 4985"]

            if not has_diameter:
                q_list.append(ClarificationQuestion(
                    parameter="Nominal Bore (NB)",
                    question="What is the nominal bore diameter?",
                    options=["15 mm (1/2\")", "25 mm (1\")", "50 mm (2\")", "100 mm (4\")", "150 mm (6\")"],
                    required_for="Determines pipe schedule, hydrostatic test pressure, and weight class."
                ))
            if not any(w in clean_text for w in ["light", "medium", "heavy", "class a", "class b", "class c"]):
                q_list.append(ClarificationQuestion(
                    parameter="Duty Class",
                    question="What is the pipe duty class?",
                    options=["Light Class (A)", "Medium Class (B)", "Heavy Class (C)"],
                    required_for="Sets minimum wall thickness tolerance under Steel Tubes QCO."
                ))
            if not any(w in clean_text for w in ["galvanized", "zinc", "black"]):
                q_list.append(ClarificationQuestion(
                    parameter="Coating & Galvanizing",
                    question="Is hot-dip zinc galvanization required?",
                    options=["Galvanized (Hot-Dip Zinc Coated 360 g/m2)", "Black (Uncoated Mild Steel)"],
                    required_for="Specifies potable water corrosion resistance requirements under IS 4736."
                ))

        # 5. Electric Induction Motors
        elif any(w in clean_text for w in ["motor", "induction motor", "electric motor"]):
            detected_prod = "Three-Phase Induction Motor"
            detected_div = "Electrotechnical (ETD 15)"
            candidates = ["IS 12615 : 2018", "IS 325", "IS 996"]

            if not has_power:
                q_list.append(ClarificationQuestion(
                    parameter="Rated Power Output",
                    question="What is the rated motor output power?",
                    options=["3.7 kW (5 HP)", "7.5 kW (10 HP)", "15 kW (20 HP)", "30 kW (40 HP)"],
                    required_for="Maps motor frame size and efficiency thresholds."
                ))
            if not has_voltage:
                q_list.append(ClarificationQuestion(
                    parameter="Supply Voltage & Phase",
                    question="What is the supply voltage & phase?",
                    options=["415 V (3-Phase, 50 Hz)", "230 V (1-Phase, 50 Hz)"],
                    required_for="Distinguishes industrial three-phase line-operated motors from fractional HP motors."
                ))
            if not any(w in clean_text for w in ["ie2", "ie3", "ie4", "efficiency"]):
                q_list.append(ClarificationQuestion(
                    parameter="Energy Efficiency Level",
                    question="Which energy efficiency class is specified?",
                    options=["IE2 (High Efficiency)", "IE3 (Premium Efficiency - Mandatory QCO)", "IE4 (Super Premium)"],
                    required_for="Enforces Electric Motors Quality Control Order energy loss limits."
                ))

        # 6. CCTV & Surveillance
        elif any(w in clean_text for w in ["cctv", "camera", "ip camera", "surveillance"]):
            detected_prod = "Network IP CCTV Surveillance Camera"
            detected_div = "Electronics & IT (LITD)"
            candidates = ["IS 13252 (Part 1) : 2010", "IS/IEC 62676-1-1"]

            if not any(w in clean_text for w in ["mp", "megapixel", "1080p", "4k", "2k"]):
                q_list.append(ClarificationQuestion(
                    parameter="Resolution",
                    question="What sensor resolution is required?",
                    options=["2 MP (Full HD 1080p)", "4 MP (2K)", "5 MP", "8 MP (4K Ultra HD)"],
                    required_for="Defines imaging clarity and bandwidth requirements."
                ))
            if not any(w in clean_text for w in ["ip66", "ip67", "bullet", "dome", "outdoor", "indoor"]):
                q_list.append(ClarificationQuestion(
                    parameter="Enclosure & Ingress Protection",
                    question="What housing and ingress protection (IP) rating is needed?",
                    options=["IP66 Outdoor Weatherproof Bullet", "IP67 Heavy Weather Vandal Dome", "Indoor Dome"],
                    required_for="Determines weatherproofing and environmental ingress resistance."
                ))

        # 7. Fire Extinguisher
        elif any(w in clean_text for w in ["fire extinguisher", "extinguisher", "fire safety"]):
            detected_prod = "Portable Fire Extinguisher"
            detected_div = "Chemical & Fire Safety (CHD 22)"
            candidates = ["IS 15683 : 2018", "IS 2190"]

            if not any(w in clean_text for w in ["abc", "co2", "foam", "powder", "water"]):
                q_list.append(ClarificationQuestion(
                    parameter="Extinguishing Medium",
                    question="What fire extinguishing agent is specified?",
                    options=["ABC Dry Chemical Powder (MAP based)", "Carbon Dioxide CO2 (Electrical)", "Mechanical Foam AFFF", "Clean Agent"],
                    required_for="Determines applicable fire risk classes (A, B, C, or E)."
                ))
            if not any(w in clean_text for w in ["kg", "ltr", "litre"]):
                q_list.append(ClarificationQuestion(
                    parameter="Capacity",
                    question="What cylinder capacity is required?",
                    options=["2 kg", "4 kg", "6 kg", "9 kg"],
                    required_for="Sets minimum fire rating and discharge duration."
                ))

        # 8. Structural Steel
        elif any(w in clean_text for w in ["structural steel", "i-beam", "angle iron", "channel", "joist"]):
            detected_prod = "Hot Rolled Structural Steel"
            detected_div = "Civil & Metallurgical (CED / MTD)"
            candidates = ["IS 2062 : 2011", "IS 808", "IS 800"]

            if not has_grade:
                q_list.append(ClarificationQuestion(
                    parameter="Steel Grade",
                    question="What structural steel grade is specified?",
                    options=["E 250 (Fe 410W - Standard)", "E 300", "E 350 (High Tensile)", "E 450"],
                    required_for="Determines minimum yield strength and tensile limits under Steel QCO."
                ))
            if not any(w in clean_text for w in ["sub quality", "sub-quality", "br", "bo", "charpy", "impact"]):
                q_list.append(ClarificationQuestion(
                    parameter="Impact Test Sub-Quality",
                    question="Is sub-zero Charpy impact testing required?",
                    options=["Grade A (Standard Room Temp)", "Grade BR (Charpy impact tested at 0 deg C)", "Grade BO (Charpy impact tested at -20 deg C)"],
                    required_for="Prevents brittle fracture in low-temperature and seismic infrastructure."
                ))

        # Ambiguity Evaluation
        is_ambiguous = len(q_list) > 0
        if is_ambiguous:
            msg = f"Query '{query}' contains engineering ambiguity. {len(q_list)} clarifying parameter(s) detected to pinpoint exact Indian Standard."
        else:
            msg = f"Query '{query}' contains sufficient technical constraints for deterministic recommendation."

        return ClarifyResponse(
            query=query,
            is_ambiguous=is_ambiguous,
            detected_product=detected_prod,
            detected_division=detected_div,
            clarifying_questions=q_list,
            candidate_standards_considered=candidates,
            message=msg
        )

