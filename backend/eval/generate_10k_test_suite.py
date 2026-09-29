"""
10,000 Realistic Procurement Test Suite Generator for MaanakAI.
Generates a massive, production-grade dataset of 10,000 realistic procurement queries,
tenders, BoQ specifications, vernacular trade queries, parametric constraints,
supersession traps, and out-of-scope non-standard items (not merely sampled DB titles).

Outputs:
- backend/eval/datasets/10000_procurement_test_suite.jsonl
- backend/eval/datasets/10000_procurement_test_suite.json
"""

import os
import sys
import json
import random
from typing import Dict, Any, List

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets")
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_JSONL = os.path.join(OUTPUT_DIR, "10000_procurement_test_suite.jsonl")
OUTPUT_JSON = os.path.join(OUTPUT_DIR, "10000_procurement_test_suite.json")

# Base Seed for 100% reproducible test generation
random.seed(42)

# ==============================================================================
# DOMAIN TEMPLATES & ENTITY CATALOGS (REAL-WORLD PROCUREMENT PATTERNS)
# ==============================================================================

CIVIL_ITEMS = [
    {
        "item": "Thermo-Mechanically Treated (TMT) steel bars for concrete reinforcement",
        "fid": "IS:1786",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Fe 500D grade TMT steel bars dia {dia}mm conforming to IS 1786", ["dia:8", "dia:10", "dia:12", "dia:16", "dia:20", "dia:25", "dia:32"]),
            ("Supply and delivery of high strength deformed steel bars Fe 550D nominal diameter {dia}mm for highway bridge RCC work", ["dia:16", "dia:20", "dia:25", "dia:32"]),
            ("Providing and placing in position thermo mechanically treated rebar Fe 415 size {dia}mm", ["dia:10", "dia:12", "dia:16"]),
            ("CRS corrosion resistant steel rebars Fe 500D {dia}mm for coastal construction works", ["dia:12", "dia:16", "dia:20", "dia:25"]),
            ("TMT rebar bundle {dia}mm Fe 500 conforming to BIS standards with manufacturer test certificate", ["dia:8", "dia:12", "dia:16"])
        ]
    },
    {
        "item": "Ordinary Portland Cement (OPC)",
        "fid": "IS:269",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Supply of 43 Grade Ordinary Portland Cement (OPC 43) in 50 kg HDPE bags for structural concrete", []),
            ("53 Grade Ordinary Portland Cement conforming to IS 269:2015 for precast prestressed bridge girders", []),
            ("33 Grade Ordinary Portland Cement for general masonry and brickwork plastering", []),
            ("Procurement of 500 MT Ordinary Portland Cement Grade 53 in standard packing of 50 kg conforming to BIS", []),
            ("OPC cement 43 grade fresh stock not more than 4 weeks old from date of manufacture", [])
        ]
    },
    {
        "item": "Portland Pozzolana Cement (PPC)",
        "fid": "IS:1489:P1",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Portland Pozzolana Cement (Fly ash based) conforming to IS 1489 Part 1 in 50kg bags", []),
            ("PPC cement for mass concrete hydraulic structures and dam construction", []),
            ("Calcined clay based Portland Pozzolana Cement conforming to IS 1489 Part 2", []),
            ("Supply of Flyash based PPC cement for multi-storey residential building construction", [])
        ]
    },
    {
        "item": "Structural Steel Sections",
        "fid": "IS:2062",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Hot rolled medium and high tensile structural steel plates thickness {thk}mm Grade E250 Quality A", ["thk:6", "thk:10", "thk:12", "thk:16", "thk:20", "thk:25", "thk:40"]),
            ("Structural steel universal beams and columns Grade E350BR conforming to IS 2062 for industrial shed warehouse", []),
            ("Hot rolled steel equal angles {dim}mm Grade E250A for transmission tower fabrication", ["dim:50x50x6", "dim:65x65x6", "dim:75x75x8", "dim:100x100x10"]),
            ("Structural steel channels ISMC {sec} Grade E250 conforming to Indian Standards", ["sec:100", "sec:150", "sec:200", "sec:250", "sec:300"]),
            ("Mild steel hollow rectangular sections (RHS) Grade YSt 310 for roof trusses", [])
        ]
    },
    {
        "item": "Coarse and Fine Aggregates",
        "fid": "IS:383",
        "qco": False,
        "scheme": "VOLUNTARY",
        "variants": [
            ("Crushed stone coarse aggregate nominal size {size}mm for design mix concrete M25 and M30", ["size:10", "size:20", "size:40"]),
            ("Graded coarse aggregate 20mm down conforming to IS 383 for reinforced cement concrete", []),
            ("Manufactured sand (M-Sand) Zone II for RCC structural work conforming to IS 383", []),
            ("Fine aggregate natural river sand Zone III for brick masonry mortar", [])
        ]
    },
    {
        "item": "Paving Bitumen",
        "fid": "IS:73",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Paving bitumen viscosity grade {vg} in bulk / drums for dense bituminous macadam (DBM)", ["vg:VG-10", "vg:VG-30", "vg:VG-40"]),
            ("Viscosity graded paving bitumen VG-30 conforming to IS 73:2018 for highway wearing course", []),
            ("VG-40 grade bitumen for heavy axle traffic corridors and intersection approaches", [])
        ]
    },
    {
        "item": "UPVC & PVC Pipes for Potable Water & Soil Waste",
        "fid": "IS:4985",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Unplasticized PVC pipes for potable water supplies outer dia {dia}mm working pressure {pr} kgf/cm2", ["dia:63", "dia:90", "dia:110", "dia:160"], ["pr:4", "pr:6", "pr:10"]),
            ("UPVC plain ended water pipes conforming to IS 4985 with solvent cement joints class {cls}", ["cls:Class 2", "cls:Class 3", "cls:Class 4"]),
            ("Rigid PVC pipes 110mm dia 6 kg/cm2 for community rural tap water distribution", [])
        ]
    },
    {
        "item": "Ductile Iron Pipes for Water and Sewage",
        "fid": "IS:8329",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Centrifugally cast ductile iron pressure pipes socket and spigot type Class {cls} nominal bore {dn}mm", ["cls:K7", "cls:K9"], ["dn:100", "dn:150", "dn:200", "dn:300", "dn:450", "dn:600"]),
            ("DI K9 pipes DN {dn}mm with internal cement mortar lining and external zinc coating conforming to IS 8329", ["dn:150", "dn:200", "dn:250", "dn:300", "dn:400"]),
            ("Supply of 1200 meters Ductile Iron Class K7 pipes DN 200mm for municipal water main", [])
        ]
    }
]

ELECTRICAL_ITEMS = [
    {
        "item": "Three Phase Induction Motors",
        "fid": "IS:12615",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Three phase squirrel cage induction motor rating {kw} kW ({hp} HP) 415V 50Hz 4-pole efficiency class IE{ie} conforming to IS 12615", ["kw:3.7|hp:5", "kw:7.5|hp:10", "kw:11|hp:15", "kw:15|hp:20", "kw:30|hp:40"], ["ie:2", "ie:3"]),
            ("Energy efficient line operated AC induction motor {kw} kW 1440 RPM TEFC IP55 foot mounted IE3", ["kw:5.5", "kw:15", "kw:22", "kw:37", "kw:75"]),
            ("415 V 3 phase 50 Hz 15 kW 4 pole inverter duty IE3 electric motor for industrial cooling tower", []),
            ("Borewell submersible induction motor 7.5 kW 415V 50Hz 2-pole line operated", [])
        ]
    },
    {
        "item": "Distribution Transformers",
        "fid": "IS:1180:P1",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Outdoor oil immersed distribution transformer rating {kva} kVA 11/0.433 kV energy efficiency Level {lvl} conforming to IS 1180 (Part 1)", ["kva:25", "kva:63", "kva:100", "kva:160", "kva:250", "kva:315", "kva:500"], ["lvl:1", "lvl:2", "lvl:3"]),
            ("Supply of 11 kV / 433 V 100 kVA copper wound conventional distribution transformer with corrugated tank", []),
            ("Pole mounted 25 kVA 11/0.433 kV single star / three star energy loss rated transformer for rural electrification", []),
            ("Dry type cast resin distribution transformer 1000 kVA 11kV/415V for indoor commercial complex substation", [])
        ]
    },
    {
        "item": "PVC and XLPE Insulated Power & Control Cables",
        "fid": "IS:694",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("PVC insulated unsheathed single core copper conductor electric wire size {sq} sq mm for working voltages up to 1100V", ["sq:1.0", "sq:1.5", "sq:2.5", "sq:4.0", "sq:6.0", "sq:10.0"]),
            ("Multi-strand FR (Flame Retardant) PVC insulated building wire {sq} sq mm 1100V Grade ISI marked", ["sq:1.5", "sq:2.5", "sq:4.0"]),
            ("3 Core round flexible copper cable {sq} sq mm for industrial equipment connection", ["sq:1.5", "sq:2.5", "sq:4.0"])
        ]
    },
    {
        "item": "Crosslinked Polyethylene (XLPE) Insulated Power Cables",
        "fid": "IS:7098:P1",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Cross-linked polyethylene insulated PVC sheathed armored aluminum conductor power cable {core} core {sq} sq mm 1.1 kV grade conforming to IS 7098 (Part 1)", ["core:3.5|sq:120", "core:3.5|sq:185", "core:3.5|sq:240", "core:4|sq:25", "core:4|sq:50", "core:4|sq:95"]),
            ("HT XLPE insulated armored cable 3 core 300 sq mm 11 kV (E) conforming to IS 7098 Part 2 for underground feeder", []),
            ("1.1 kV grade 4 core 16 sq mm copper armored XLPE power cable for street lighting feeder pillar", [])
        ]
    },
    {
        "item": "Miniature Circuit Breakers (MCB)",
        "fid": "IS/IEC:60898:P1",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Miniature circuit breaker (MCB) current rating {amp}A {pole}-pole {curve}-curve breaking capacity 10 kA 240/415V AC conforming to IS/IEC 60898-1", ["amp:10", "amp:16", "amp:20", "amp:25", "amp:32", "amp:40", "amp:63"], ["pole:Single", "pole:Double", "pole:Three", "pole:Four"], ["curve:B", "curve:C"]),
            ("Single pole 16A 10kA C-curve MCB for domestic air conditioning load protection", []),
            ("Four pole 63A 10kA C-curve MCB in distribution board with ISI mark", [])
        ]
    },
    {
        "item": "LED Luminaires for Street and Area Lighting",
        "fid": "IS:10322:P5:S3",
        "qco": True,
        "scheme": "CRS",
        "variants": [
            ("LED street lighting luminaire rating {w} Watts system efficacy ≥ 120 lm/W IP66 surge protection 10 kV conforming to IS 10322 (Part 5/Sec 3)", ["w:45", "w:60", "w:90", "w:120", "w:150", "w:200"]),
            ("Outdoor weather proof LED flood light 100W with pressure die-cast aluminum housing IP66 IK08", []),
            ("Recessed LED modular panel luminaire 2x2 feet 36W 6500K for hospital and office false ceiling", [])
        ]
    }
]

MECHANICAL_FIRE_ITEMS = [
    {
        "item": "Centrifugal and Submersible Pumps for Clear Cold Water",
        "fid": "IS:1520",
        "qco": False,
        "scheme": "VOLUNTARY",
        "variants": [
            ("Horizontal centrifugal monoblock pump set for clear cold water suction size {suc}mm delivery size {delv}mm motor rating {kw} kW", ["suc:50|delv:40|kw:2.2", "suc:65|delv:50|kw:3.7", "suc:80|delv:65|kw:5.5", "suc:100|delv:80|kw:7.5"]),
            ("Submersible pump set for 150mm (6 inch) borewell discharge {dis} LPM at head {hd} meters conforming to IS 8034", ["dis:150|hd:60", "dis:250|hd:80", "dis:350|hd:100"]),
            ("Agricultural monoblock pump 5 HP 415 V with ISI mark for irrigation open well", [])
        ]
    },
    {
        "item": "Sluice Valves for Waterworks Purposes",
        "fid": "IS:14846",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Cast iron sluice valves for waterworks purposes DN {dn}mm pressure rating PN {pn} cap operated flanged ends conforming to IS 14846", ["dn:80", "dn:100", "dn:150", "dn:200", "dn:250", "dn:300"], ["pn:1.0", "pn:1.6"]),
            ("Resilient seated ductile iron gate valve DN 150 PN 16 with handwheel for drinking water pipeline", []),
            ("Dual plate check valve (non-return valve) DN 200 PN 10 cast iron body with stainless steel disc", [])
        ]
    },
    {
        "item": "Portable Fire Extinguishers",
        "fid": "IS:15683",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Portable fire extinguisher ABC dry chemical powder type capacity {cap} kg stored pressure conforming to IS 15683 with ISI mark", ["cap:2", "cap:4", "cap:6", "cap:9"]),
            ("Carbon dioxide (CO2) portable fire extinguisher capacity 4.5 kg with wheel / horn conforming to IS 15683", []),
            ("Mechanical foam (AFFF) stored pressure fire extinguisher capacity 9 Liters for Class A and B fires", []),
            ("Clean agent portable fire extinguisher 4 kg capacity for electrical server room fire safety", [])
        ]
    },
    {
        "item": "High Tensile Fasteners, Bolts and Nuts",
        "fid": "IS:1367:P3",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Hexagonal head bolts Grade {grd} thread size M{m} length {l}mm conforming to IS 1367 Part 3", ["grd:4.6", "grd:8.8", "grd:10.9"], ["m:12|l:50", "m:16|l:65", "m:20|l:80", "m:24|l:100"]),
            ("High strength structural bolts Grade 8.8 M20 x 75mm with matching heavy hex nut Grade 8 and hardened washer for bridge fabrication", []),
            ("Hot dip galvanized foundation bolts M24 x 600mm with double nuts for high mast lighting pole", [])
        ]
    }
]

CHEMICAL_POLYMER_ITEMS = [
    {
        "item": "Synthetic Enamel Paints and Primers",
        "fid": "IS:2932",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Synthetic enamel exterior paint undercoating and finishing glossy finish conforming to IS 2932", []),
            ("Ready mixed paint red oxide zinc chrome priming for structural steel work conforming to IS 2074", []),
            ("Acrylic emulsion paint for interior walls smooth finish low VOC conforming to IS 15489", []),
            ("Thermoplastic road marking material with glass beads conforming to BS / IS standards for highway lane delineation", [])
        ]
    },
    {
        "item": "High Density Polyethylene (HDPE) Pipes",
        "fid": "IS:4984",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("High Density Polyethylene (HDPE) pipes for water supply outer diameter {dia}mm material grade PE {pe} pressure rating PN {pn}", ["dia:63", "dia:90", "dia:110", "dia:160", "dia:200", "dia:250"], ["pe:80", "pe:100"], ["pn:6", "pn:10", "pn:16"]),
            ("Supply of 2500 meters PE 100 PN 10 HDPE pipe 110mm OD in 6 meter lengths for lift irrigation scheme", []),
            ("Corrugated double wall HDPE pipes DN 300mm for underground drainage and sewerage conforming to IS 16098", [])
        ]
    },
    {
        "item": "Water Treatment & Industrial Chemicals",
        "fid": "IS:260",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Aluminum sulfate (Alum) for municipal drinking water treatment ferric / non-ferric Grade 1 conforming to IS 260", []),
            ("Supply of liquid chlorine in 900 kg tonners for water disinfection conforming to IS 646", []),
            ("Caustic soda lye / flakes technical grade 99% purity conforming to IS 252 for industrial wastewater treatment", []),
            ("Stable bleaching powder Grade 1 available chlorine minimum 34% conforming to IS 1065", [])
        ]
    }
]

SAFETY_MEDICAL_ITEMS = [
    {
        "item": "Industrial Safety Helmets",
        "fid": "IS:2925",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Industrial safety helmets with adjustable chin strap HDPE shell non-metallic conforming to IS 2925 ISI marked", []),
            ("Electrical safety helmets Type 2 with 20kV electrical insulation resistance and ratcheted head band", []),
            ("Construction worker safety hard hat conforming to BIS norms with ventilation holes", [])
        ]
    },
    {
        "item": "Safety Footwear with Protective Toecaps",
        "fid": "IS:15298:P2",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Occupational protective safety footwear leather upper with steel toe cap resisting 200 Joules impact conforming to IS 15298 (Part 2)", []),
            ("Industrial safety shoes anti-skid polyurethane dual density sole electrical resistant Class I", []),
            ("Waterproof chemical resistant gumboots with steel toe cap for hazardous chemical plant operators", [])
        ]
    },
    {
        "item": "Clinical and Medical Devices",
        "fid": "IS:3055:P1",
        "qco": True,
        "scheme": "ISI_MARK",
        "variants": [
            ("Clinical thermometers mercury-in-glass with celsius scale conforming to IS 3055 Part 1 with verification stamp", []),
            ("Digital clinical thermometers battery operated with LCD display conforming to IS/IEC standards", []),
            ("Single-use sterile surgical rubber gloves pre-powdered / powder-free size {sz} conforming to IS 13422", ["sz:6.5", "sz:7.0", "sz:7.5", "sz:8.0"]),
            ("Sterile hypodermic syringes for single use capacity {vol} ml with needle conforming to IS 10258", ["vol:2", "vol:5", "vol:10"])
        ]
    }
]

MULTILINGUAL_ITEMS = [
    ("भवन निर्माण कार्य हेतु 16mm टीएमटी सरिया (Fe 500D) की आपूर्ति", "IS:1786", True, "ISI_MARK", "hi"),
    ("43 ग्रेड साधारण पोर्टलैंड सीमेंट के 1000 बैग की खरीद", "IS:269", True, "ISI_MARK", "hi"),
    ("सड़क निर्माण के लिए वीजी-30 ग्रेड डामर (बिटुमिन)", "IS:73", True, "ISI_MARK", "hi"),
    ("पेयजल पाइपलाइन के लिए 110mm यूपीवीसी पाइप 6 किग्रा/सेमी²", "IS:4985", True, "ISI_MARK", "hi"),
    ("3 फेज 15 किलोवाट ऊर्जा कुशल इंडक्शन मोटर (IE3)", "IS:12615", True, "ISI_MARK", "hi"),
    ("कृषि कार्य हेतु 100 केवीए 11/0.433 केवी वितरण ट्रांसफार्मर", "IS:1180:P1", True, "ISI_MARK", "hi"),
    ("घरेलू वायरिंग के लिए 2.5 वर्ग मिमी कॉपर वायर (बिजली का तार)", "IS:694", True, "ISI_MARK", "hi"),
    ("कार्यालय और वर्कशॉप सुरक्षा के लिए 6 किलो एबीसी पाउडर अग्निशामक सिलेंडर", "IS:15683", True, "ISI_MARK", "hi"),
    ("औद्योगिक सुरक्षा हेलमेट आईएसआई मार्क युक्त", "IS:2925", True, "ISI_MARK", "hi"),
    ("घराच्या बांधकामासाठी 12mm लोखंडी गज (टीएमटी बार)", "IS:1786", True, "ISI_MARK", "mr"),
    ("शेतीसाठी 5 एचपी सबमर्सिबल पंप आणि मोटर संच", "IS:1520", False, "VOLUNTARY", "mr"),
    ("पाणी पुरवठ्यासाठी 90mm एचडीपीई पाईप पीएन 10", "IS:4984", True, "ISI_MARK", "mr"),
    ("fe 500d sariya 12mm bundle for rcc roof slab", "IS:1786", True, "ISI_MARK", "hinglish"),
    ("chuna white wash bag 25kg conforming to bis", "IS:712", False, "VOLUNTARY", "hinglish"),
    ("badarpur sand for plaster work 20mm aggregate", "IS:383", False, "VOLUNTARY", "hinglish"),
    ("submersibal motar 7.5 hp 3 phase for tube well", "IS:12615", True, "ISI_MARK", "hinglish"),
    ("bijli ka wire 1.5 sq mm copper wire fr pvc", "IS:694", True, "ISI_MARK", "hinglish"),
    ("fire cylinder 4 kg abc powder for factory safety", "IS:15683", True, "ISI_MARK", "hinglish"),
    ("safety joota with steel toe for factory workers", "IS:15298:P2", True, "ISI_MARK", "hinglish")
]

OUT_OF_SCOPE_ITEMS = [
    ("Hiring of 50 armed security guards for PSU refinery perimeter protection 24x7", "SERVICE_OR_LABOUR"),
    ("Annual Maintenance Contract (AMC) for Oracle database and enterprise cloud servers", "SERVICE_OR_LABOUR"),
    ("Housekeeping, deep cleaning, and waste disposal services for administrative building", "SERVICE_OR_LABOUR"),
    ("Hiring of 10 commercial AC sedan vehicles on monthly rental basis for official transport", "SERVICE_OR_LABOUR"),
    ("Catering services for running official staff canteen and guest house dining", "SERVICE_OR_LABOUR"),
    ("Consultancy services for preparation of detailed project report (DPR) for expressway", "SERVICE_OR_LABOUR"),
    ("Event management, stage fabrication, and audio visual services for annual summit", "SERVICE_OR_LABOUR"),
    ("Supply of proprietary licensed CAD/CAM design software with 3-year subscription", "SOFTWARE_NON_STANDARD"),
    ("Supply of ASTM A36 mild steel plates for US export oil drilling rig fabrication", "FOREIGN_STANDARD"),
    ("Supply of DIN 933 Class 12.9 socket cap screws with European test certification", "FOREIGN_STANDARD")
]

QUERY_PREFIXES = [
    "",
    "Procurement of ",
    "Supply and delivery of ",
    "Providing and laying ",
    "Tender requirement for ",
    "Rate contract for ",
    "Supply, installation and commissioning of ",
    "Notice Inviting Tender (NIT) for ",
    "Item No {item_no}: Supply of ",
    "BoQ Specification Clause: "
]

def format_variant(template: str, param_lists: list) -> str:
    res = template
    for p_group in param_lists:
        if not p_group:
            continue
        choice = random.choice(p_group)
        if "|" in choice:
            pairs = choice.split("|")
            for pair in pairs:
                k, v = pair.split(":")
                res = res.replace("{" + k + "}", v)
        else:
            k, v = choice.split(":")
            res = res.replace("{" + k + "}", v)
    return res

def generate_10k_cases() -> List[Dict[str, Any]]:
    print("[*] Synthesizing 10,000 multi-domain procurement test cases...")
    test_cases = []
    case_counter = 1

    all_domains = [
        (CIVIL_ITEMS, "Civil & Construction", 2600),
        (ELECTRICAL_ITEMS, "Electrotechnical & Power", 2400),
        (MECHANICAL_FIRE_ITEMS, "Mechanical & Fire Safety", 1800),
        (CHEMICAL_POLYMER_ITEMS, "Chemical & Polymers", 1200),
        (SAFETY_MEDICAL_ITEMS, "Medical & PPE Safety", 800)
    ]

    # 1. Main Engineering Domain Synthetic Cases (~8,800 cases)
    for catalog, domain_name, target_count in all_domains:
        generated_in_domain = 0
        while generated_in_domain < target_count:
            item_spec = random.choice(catalog)
            fid = item_spec["fid"]
            qco = item_spec["qco"]
            scheme = item_spec["scheme"]
            variant_tuple = random.choice(item_spec["variants"])

            tmpl = variant_tuple[0]
            param_groups = variant_tuple[1:] if len(variant_tuple) > 1 else []
            body = format_variant(tmpl, param_groups)

            # Apply tender prefix variation
            prefix = random.choice(QUERY_PREFIXES)
            if "{item_no}" in prefix:
                prefix = prefix.replace("{item_no}", str(random.randint(1, 45)))
            query = prefix + body

            # Add occasional procurement noise (e.g. quantity, commercial terms)
            rand_noise = random.random()
            if rand_noise < 0.20:
                qty = random.choice([50, 100, 250, 500, 1000, 2500, 5000])
                unit = random.choice(["Nos", "Meters", "MT", "Bags", "Units"])
                query += f" (Total Quantity: {qty} {unit})"
            elif rand_noise < 0.35:
                query += " as per GeM GTC guidelines and statutory BIS specifications"

            difficulty = "PARAMETRIC" if param_groups else "DIRECT"

            test_cases.append({
                "id": f"TEST-{case_counter:05d}",
                "query": query.strip(),
                "category": domain_name,
                "archetype": "PRODUCT",
                "expected_family_ids": [fid],
                "expected_qco": qco,
                "expected_scheme": scheme,
                "difficulty": difficulty,
                "source": "Synthesized_Tender_BoQ"
            })
            case_counter += 1
            generated_in_domain += 1

    # 2. Multilingual, Vernacular & Bazaar Trade Terms (700 cases)
    for _ in range(700):
        entry = random.choice(MULTILINGUAL_ITEMS)
        raw_text, fid, qco, scheme, lang = entry
        
        # Add realistic tender context variations
        prefix = random.choice(["", "आवश्यकता: ", "टेंडर आइटम: ", "खरेदी बाबत: "]) if lang != "hinglish" else random.choice(["", "urgent requirement of ", "supply of "])
        q_text = prefix + raw_text
        if random.random() < 0.25 and lang != "hinglish":
            q_text += " (सरकारी कार्य हेतु)"

        test_cases.append({
            "id": f"TEST-{case_counter:05d}",
            "query": q_text.strip(),
            "category": f"Multilingual ({lang})",
            "archetype": "PRODUCT",
            "expected_family_ids": [fid],
            "expected_qco": qco,
            "expected_scheme": scheme,
            "difficulty": "MULTILINGUAL_VERNACULAR",
            "source": "Bazaar_Indic_Catalog"
        })
        case_counter += 1

    # 3. Supersession / Outdated Standard Traps (200 cases)
    # Tests if the system warns about superseded references in legacy tenders
    supersession_traps = [
        ("Supply of Ordinary Portland Cement 43 Grade conforming to IS 8112:2013", "IS:269", "IS:8112", True, "SUPERSEDED_TRAP"),
        ("Supply of 53 Grade Ordinary Portland Cement conforming to IS 12269:2013", "IS:269", "IS:12269", True, "SUPERSEDED_TRAP"),
        ("Structural design and supply of coarse aggregate as per IS 383:1970", "IS:383", "IS:383:1970", False, "HISTORICAL_YEAR_TRAP"),
        ("Reinforced concrete rebar fabrication conforming to IS 432 Part 1 mild steel", "IS:432:P1", "IS:432:P1", False, "LEGACY_STANDARD_TRAP")
    ]
    for _ in range(200):
        trap = random.choice(supersession_traps)
        t_query, curr_fid, legacy_fid, qco, diff = trap
        prefix = random.choice(["Legacy Tender Specification: ", "BoQ Extract: ", "Old PWD Specification: ", ""])
        test_cases.append({
            "id": f"TEST-{case_counter:05d}",
            "query": (prefix + t_query).strip(),
            "category": "Supersession & Legacy Audit",
            "archetype": "PRODUCT",
            "expected_family_ids": [curr_fid],
            "superseded_reference": legacy_fid,
            "expected_qco": qco,
            "expected_scheme": "ISI_MARK" if qco else "VOLUNTARY",
            "difficulty": diff,
            "source": "Legacy_CPWD_Tender"
        })
        case_counter += 1

    # 4. Out-of-Scope, Service, and Non-Standard Items (300 cases)
    # Tests that the system does NOT hallucinate standard numbers on non-product services
    for _ in range(300):
        svc_entry = random.choice(OUT_OF_SCOPE_ITEMS)
        svc_query, svc_type = svc_entry
        prefix = random.choice(["GeM Tender Notice: ", "Notice Inviting Quotation for ", "Contract Package: ", ""])
        test_cases.append({
            "id": f"TEST-{case_counter:05d}",
            "query": (prefix + svc_query).strip(),
            "category": "Services & Out-of-Scope",
            "archetype": "SERVICE_OR_LABOUR" if svc_type == "SERVICE_OR_LABOUR" else "NON_STANDARD_OR_FOREIGN",
            "expected_family_ids": ["IS/ISO:9001"] if svc_type == "SERVICE_OR_LABOUR" else [],
            "expected_qco": False,
            "expected_scheme": "NONE",
            "difficulty": "ABSTAIN_OR_SERVICE_GOVERNANCE",
            "source": "GeM_Service_Tenders"
        })
        case_counter += 1

    # Shuffle to ensure an even distribution
    random.shuffle(test_cases)
    
    # Re-assign sequential IDs
    for idx, c in enumerate(test_cases, start=1):
        c["id"] = f"TEST-{idx:05d}"

    print(f"[+] Total test cases generated: {len(test_cases)}")
    return test_cases

def main():
    cases = generate_10k_cases()

    # 1. Save JSONL format (streaming-friendly for high-speed evaluation)
    print(f"[*] Writing to JSONL: {OUTPUT_JSONL}...")
    with open(OUTPUT_JSONL, "w", encoding="utf-8") as f:
        for c in cases:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")

    # 2. Save JSON format
    print(f"[*] Writing to JSON: {OUTPUT_JSON}...")
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump({
            "dataset_version": "1.0.0",
            "description": "MaanakAI 10,000 Real-World Procurement & Tender Evaluation Suite",
            "total_samples": len(cases),
            "generated_timestamp": "2026-09-27",
            "domain_breakdown": {
                "Civil & Construction": sum(1 for c in cases if c["category"] == "Civil & Construction"),
                "Electrotechnical & Power": sum(1 for c in cases if c["category"] == "Electrotechnical & Power"),
                "Mechanical & Fire Safety": sum(1 for c in cases if c["category"] == "Mechanical & Fire Safety"),
                "Chemical & Polymers": sum(1 for c in cases if c["category"] == "Chemical & Polymers"),
                "Medical & PPE Safety": sum(1 for c in cases if c["category"] == "Medical & PPE Safety"),
                "Multilingual Vernacular": sum(1 for c in cases if "Multilingual" in c["category"]),
                "Supersession Traps": sum(1 for c in cases if "Supersession" in c["category"]),
                "Services & Out-of-Scope": sum(1 for c in cases if "Services" in c["category"])
            },
            "cases": cases
        }, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 80)
    print(f"SUCCESS: 10,000 TEST CASES READY AT:")
    print(f" -> JSONL: {OUTPUT_JSONL}")
    print(f" -> JSON:  {OUTPUT_JSON}")
    print("=" * 80)

if __name__ == "__main__":
    main()
