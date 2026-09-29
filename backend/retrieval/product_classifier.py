"""
Product and Domain Classification Layer (Layer 9 from Architecture Specification).
Converts raw procurement queries into a canonical engineering specification object:
- domain: Engineering / Industry domain
- product: Specific physical product noun (e.g., "Steel Tube", "Steel Rebar", "Clay Brick")
- material: Constituent base material (e.g., "Mild Steel", "Unplasticized PVC", "Concrete")
- application: Engineering application (e.g., "Water Conveyance", "Concrete Reinforcement")
- form: Physical artifact form (e.g., "Tube", "Pipe", "Bar", "Brick", "Block", "Cable", "Pump")
- size: Extracted dimension or sizing
- requirements: Inherent engineering requirements (dimensions, wall thickness, strength, etc.)
- tests: Standard quality testing requirements
- standard_type: "Product Standard" | "Test Standard" | "Code of Practice"
"""

import re
from typing import Dict, Any, List, Optional

# Standard product taxonomies with domain, material, form, and default requirements
PRODUCT_TAXONOMY = {
    # Tubes and Pipes
    "steel tube": {
        "domain": "Water Supply / Plumbing",
        "product": "Steel Tube",
        "material": "Mild Steel",
        "application": "Water Conveyance / Industrial Piping",
        "form": "Tube",
        "requirements": ["dimensions", "wall thickness", "mass", "mechanical properties", "workmanship"],
        "tests": ["tensile test", "bend test", "flattening test", "hydrostatic test"]
    },
    "mild steel tube": {
        "domain": "Water Supply / Plumbing",
        "product": "Steel Tube",
        "material": "Mild Steel",
        "application": "Water Conveyance / Industrial Piping",
        "form": "Tube",
        "requirements": ["dimensions", "wall thickness", "mass", "mechanical properties", "workmanship"],
        "tests": ["tensile test", "bend test", "flattening test", "hydrostatic test"]
    },
    "ms tube": {
        "domain": "Water Supply / Plumbing",
        "product": "Steel Tube",
        "material": "Mild Steel",
        "application": "Water Conveyance / Industrial Piping",
        "form": "Tube",
        "requirements": ["dimensions", "wall thickness", "mass", "mechanical properties", "workmanship"],
        "tests": ["tensile test", "bend test", "flattening test", "hydrostatic test"]
    },
    "gi pipe": {
        "domain": "Water Supply / Plumbing",
        "product": "Galvanized Iron Tube",
        "material": "Galvanized Steel",
        "application": "Water Conveyance / Gas and Air",
        "form": "Tube",
        "requirements": ["dimensions", "galvanizing coating mass", "uniformity of coating", "workmanship"],
        "tests": ["tensile test", "bend test", "galvanizing adhesion test", "hydrostatic test"]
    },
    "upvc pipe": {
        "domain": "Water Supply / Plumbing",
        "product": "UPVC Pipe",
        "material": "Unplasticized PVC",
        "application": "Potable Water Supply",
        "form": "Pipe",
        "requirements": ["dimensions", "wall thickness", "density", "opacity", "workmanship"],
        "tests": ["internal hydrostatic pressure test", "impact strength test", "reversion test"]
    },
    "swr pipe": {
        "domain": "Civil / Drainage & Sewerage",
        "product": "UPVC SWR Pipe",
        "material": "Unplasticized PVC",
        "application": "Soil, Waste and Ventilation Discharge",
        "form": "Pipe",
        "requirements": ["dimensions", "wall thickness", "impact resistance", "chemical resistance"],
        "tests": ["impact test at 0 deg C", "internal hydrostatic test", "tensile strength test"]
    },
    "hdpe pipe": {
        "domain": "Water Supply / Plumbing",
        "product": "HDPE Pipe",
        "material": "High Density Polyethylene",
        "application": "Water Supply / Industrial Effluents",
        "form": "Pipe",
        "requirements": ["dimensions", "wall thickness", "melt flow rate", "carbon black content"],
        "tests": ["hydrostatic pressure test", "oxidation induction time", "elongation at break"]
    },

    # Rebar and Structural Steel
    "rebar": {
        "domain": "Civil / Concrete Reinforcement",
        "product": "Steel Rebar",
        "material": "High Strength Deformed Steel",
        "application": "Concrete Reinforcement",
        "form": "Bar",
        "requirements": ["nominal size", "cross-sectional area", "mass per metre", "rib geometry"],
        "tests": ["tensile yield strength test", "elongation test", "bend and rebend test"]
    },
    "tmt": {
        "domain": "Civil / Concrete Reinforcement",
        "product": "Steel Rebar",
        "material": "High Strength Deformed Steel (TMT)",
        "application": "Concrete Reinforcement",
        "form": "Bar",
        "requirements": ["nominal diameter", "yield strength Fe 500D", "elongation", "mass per metre"],
        "tests": ["tensile yield strength test", "elongation test", "bend and rebend test"]
    },
    "sariya": {
        "domain": "Civil / Concrete Reinforcement",
        "product": "Steel Rebar",
        "material": "High Strength Deformed Steel",
        "application": "Concrete Reinforcement",
        "form": "Bar",
        "requirements": ["nominal diameter", "yield strength", "elongation", "mass per metre"],
        "tests": ["tensile yield strength test", "elongation test", "bend and rebend test"]
    },
    "structural steel": {
        "domain": "Civil / Structural Engineering",
        "product": "Structural Steel Section",
        "material": "Hot Rolled Medium/High Tensile Steel",
        "application": "Structural Framing / Beams & Columns",
        "form": "Section",
        "requirements": ["dimensions", "mass", "tensile strength", "yield stress", "impact energy"],
        "tests": ["tensile test", "bend test", "charpy impact test"]
    },

    # Masonry and Bricks
    "brick": {
        "domain": "Civil / Masonry",
        "product": "Clay Brick",
        "material": "Common Burnt Clay",
        "application": "Masonry Construction / Walls",
        "form": "Brick",
        "requirements": ["dimensions", "compressive strength class", "water absorption", "efflorescence", "shape"],
        "tests": ["compressive strength test", "water absorption test", "efflorescence test", "warpage test"]
    },
    "concrete block": {
        "domain": "Civil / Masonry",
        "product": "Concrete Block",
        "material": "Precast Concrete",
        "application": "Masonry Construction / Load Bearing Walls",
        "form": "Block",
        "requirements": ["dimensions", "compressive strength", "block density", "drying shrinkage"],
        "tests": ["compressive strength test", "density test", "water absorption test"]
    },

    # Cement
    "cement": {
        "domain": "Civil / Cement & Concrete",
        "product": "Ordinary Portland Cement",
        "material": "Hydraulic Cement",
        "application": "Structural Concrete / Mortar",
        "form": "Powder",
        "requirements": ["fineness", "soundness", "setting time", "compressive strength 43/53 Grade"],
        "tests": ["fineness by blaine", "setting time test", "compressive strength of mortar cubes"]
    },

    # Pumps and Motors
    "pump": {
        "domain": "Mechanical / Water Pumping",
        "product": "Water Pump",
        "material": "Cast Iron / Bronze / Stainless Steel",
        "application": "Water Conveyance / Irrigation & Drainage",
        "form": "Pump",
        "requirements": ["discharge capacity", "head", "overall efficiency", "power input"],
        "tests": ["hydraulic performance test", "cavitation test", "hydrostatic pressure test"]
    },
    "submersible pump": {
        "domain": "Mechanical / Water Pumping",
        "product": "Submersible Pumpset",
        "material": "Stainless Steel / Cast Iron",
        "application": "Deep Tube Well Water Pumping",
        "form": "Pumpset",
        "requirements": ["flow rate", "head", "motor efficiency", "insulation resistance"],
        "tests": ["hydraulic performance test", "high voltage test", "insulation resistance test"]
    },
    "induction motor": {
        "domain": "Electrical / Rotating Machines",
        "product": "Induction Motor",
        "material": "Cast Iron / Copper Winding",
        "application": "Industrial Mechanical Drive",
        "form": "Motor",
        "requirements": ["rated power kW", "voltage 415V", "efficiency class IE2/IE3", "insulation Class F"],
        "tests": ["no load test", "locked rotor test", "temperature rise test", "efficiency test"]
    },

    # Electrical and Lighting
    "cable": {
        "domain": "Electrical / Power Cables",
        "product": "Power Cable",
        "material": "Copper/Aluminium Conductor, PVC/XLPE Insulation",
        "application": "Electric Power and Lighting Wiring",
        "form": "Cable",
        "requirements": ["conductor resistance", "insulation thickness", "voltage grade 1100V", "flame retardancy"],
        "tests": ["conductor resistance test", "high voltage test", "tensile and elongation test"]
    },
    "transformer": {
        "domain": "Electrical / Power Distribution",
        "product": "Distribution Transformer",
        "material": "CRGO Steel Core, Copper/Aluminium Winding, Mineral Oil",
        "application": "Step-down Power Distribution",
        "form": "Transformer",
        "requirements": ["rated kVA", "voltage ratio 11kV/415V", "no-load losses", "load losses"],
        "tests": ["no-load loss test", "load loss test", "temperature rise test", "dielectric breakdown test"]
    },
    "luminaire": {
        "domain": "Electrical / Lighting",
        "product": "LED Luminaire",
        "material": "Die-cast Aluminium / Polycarbonate",
        "application": "General / Road and Street Lighting",
        "form": "Luminaire",
        "requirements": ["wattage", "luminous efficacy lm/W", "color temperature CCT", "IP rating", "power factor"],
        "tests": ["photometric performance test", "ingress protection IP test", "insulation resistance test"]
    },
    "fire extinguisher": {
        "domain": "Safety & Fire Protection",
        "product": "Portable Fire Extinguisher",
        "material": "Mild Steel / Seamless Cylinder",
        "application": "Fire Hazard Suppression",
        "form": "Extinguisher",
        "requirements": ["extinguishing agent capacity", "operating pressure", "fire rating class", "discharge time"],
        "tests": ["hydraulic burst pressure test", "discharge test", "fire rating test"]
    }
}

class ProductClassifier:
    def __init__(self):
        pass

    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classifies procurement text into a canonical Product Specification:
        - domain
        - product
        - material
        - application
        - form
        - size
        - requirements
        - tests
        - standard_type
        """
        lower = text.lower().strip()
        
        # 1. Determine standard_type (Product vs Test vs Code of Practice)
        if any(w in lower for w in ["method of test", "methods of test", "testing procedure", "acceptance test", "sampling plan"]):
            standard_type = "Test Standard"
        elif any(w in lower for w in ["code of practice", "guidelines for", "installation practice", "laying and jointing"]):
            standard_type = "Code of Practice"
        else:
            standard_type = "Product Standard"

        # 2. Match Product Taxonomy (Longest key match first)
        matched_tax = None
        for key in sorted(PRODUCT_TAXONOMY.keys(), key=lambda x: -len(x)):
            # Word boundary regex matching
            if re.search(rf'\b{re.escape(key)}s?\b', lower):
                matched_tax = PRODUCT_TAXONOMY[key]
                break

        # Fallback heuristic classification if not an exact match in taxonomy
        if not matched_tax:
            matched_tax = self._heuristic_classification(lower)

        # 3. Extract dimensions / size
        size_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:mm|cm|m|inch|"|kv|kw|kva|hp|litre|ltr|kg|ton))\b', lower)
        size = size_match.group(1) if size_match else None

        # 4. Extract explicit material if mentioned
        material = matched_tax.get("material")
        material_keywords = {
            "mild steel": "Mild Steel",
            "carbon steel": "Carbon Steel",
            "stainless steel": "Stainless Steel",
            "galvanized": "Galvanized Steel",
            "upvc": "Unplasticized PVC",
            "pvc": "Polyvinyl Chloride (PVC)",
            "hdpe": "High Density Polyethylene",
            "cast iron": "Cast Iron",
            "ductile iron": "Ductile Iron",
            "copper": "Copper",
            "aluminium": "Aluminium",
            "brass": "Brass",
            "concrete": "Concrete",
            "burnt clay": "Common Burnt Clay"
        }
        for mk, mv in material_keywords.items():
            if re.search(rf'\b{re.escape(mk)}\b', lower):
                material = mv
                break

        # 5. Extract application if specifically described
        application = matched_tax.get("application")
        if re.search(r'\bcarrying\s+water\b|\bwater\s+supply\b|\bdrinking\s+water\b', lower):
            application = "Water Conveyance"
        elif re.search(r'\bsoil\b|\bwaste\b|\bdrainage\b|\bsewerage\b', lower):
            application = "Soil, Waste and Drainage"
        elif re.search(r'\breinforced\s+concrete\b|\brcc\b|\breinforcement\b', lower):
            application = "Concrete Reinforcement"
        elif re.search(r'\bmasonry\b|\bwall\s+construction\b', lower):
            application = "Masonry Construction"
        elif re.search(r'\bstreet\s+lighting\b|\broad\s+lighting\b', lower):
            application = "Road and Street Lighting"

        return {
            "domain": matched_tax.get("domain", "General Engineering"),
            "product": matched_tax.get("product", "Engineering Component"),
            "material": material,
            "application": application,
            "form": matched_tax.get("form", "Item"),
            "size": size,
            "requirements": matched_tax.get("requirements", ["dimensions", "workmanship", "performance"]),
            "tests": matched_tax.get("tests", ["routine acceptance test", "visual inspection"]),
            "standard_type": standard_type
        }

    def _heuristic_classification(self, lower: str) -> Dict[str, Any]:
        """Heuristic fallback for uncommon or generic terms."""
        if any(w in lower for w in ["tube", "tubular"]):
            return {
                "domain": "Mechanical / Piping",
                "product": "Steel Tube",
                "material": "Steel",
                "application": "Fluid / Structural Conveyance",
                "form": "Tube",
                "requirements": ["dimensions", "wall thickness", "workmanship"],
                "tests": ["hydrostatic test", "tensile test"]
            }
        elif any(w in lower for w in ["pipe"]):
            return {
                "domain": "Water Supply / Piping",
                "product": "Piping System",
                "material": "Plastics / Metal",
                "application": "Fluid Conveyance",
                "form": "Pipe",
                "requirements": ["dimensions", "pressure rating", "workmanship"],
                "tests": ["hydrostatic test"]
            }
        elif any(w in lower for w in ["valve"]):
            return {
                "domain": "Mechanical / Valves",
                "product": "Control Valve",
                "material": "Cast Iron / Bronze",
                "application": "Flow Control",
                "form": "Valve",
                "requirements": ["dimensions", "seat leakage", "operating torque"],
                "tests": ["body pressure test", "seat tightness test"]
            }
        elif any(w in lower for w in ["wire", "conductor"]):
            return {
                "domain": "Electrical / Conductors",
                "product": "Electrical Conductor",
                "material": "Copper / Aluminium",
                "application": "Electrical Transmission",
                "form": "Wire",
                "requirements": ["conductor resistance", "tensile strength"],
                "tests": ["resistance test"]
            }
        return {
            "domain": "General Engineering",
            "product": "General Engineering Goods",
            "material": "Specified Material",
            "application": "General Purpose",
            "form": "Fabricated Item",
            "requirements": ["dimensions", "workmanship"],
            "tests": ["acceptance test"]
        }

product_classifier = ProductClassifier()
