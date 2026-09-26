"""
Migration script to populate persistent standard_aliases table and aliases_fts virtual table in standards.db.
Decouples trade lexicon and procurement synonyms from Python source code into the database.
"""

import os
import sqlite3
from typing import Dict, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "standards.db")

# Comprehensive Trade, Colloquial, and GeM/CPWD Procurement Taxonomy
SEED_ALIASES = [
    # Steel, Rebar & Metallurgical
    ("sariya", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Hinglish Trade"),
    ("tmt", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Trade Acronym"),
    ("rebar", "IS:1786", "steel bars for concrete reinforcement", "Civil Engineering", "Engineering Term"),
    ("tmt bar", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Trade Name"),
    ("tmt bars", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Trade Name"),
    ("fe 500", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Material Grade"),
    ("fe 500d", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Material Grade"),
    ("fe 415", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Material Grade"),
    ("fe 550", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Material Grade"),
    ("fe 550d", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Material Grade"),
    ("सरिया", "IS:1786", "high strength deformed steel bars and wires", "Civil Engineering", "Hindi Colloquial"),
    ("carbon steel tube", "IS:3601", "steel tubes for mechanical and general engineering", "Mechanical Engineering", "Trade Name"),
    ("carbon steel pipe", "IS:3601", "steel tubes for mechanical and general engineering", "Mechanical Engineering", "Trade Name"),
    ("plain g.s. sheet", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("plain gs sheet", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("g.s. sheet", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("gs sheet", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("g.i. profile sheet", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("gi profile sheet", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("ridges or hips", "IS:277", "galvanized steel strips and sheets plain and corrugated", "Metallurgical Engineering", "Trade Name"),
    ("gold jewellery", "IS:1417", "gold and gold alloys jewellery artefacts fineness marking", "Metallurgical Engineering", "Commercial Trade"),
    ("gold coin", "IS:1417", "gold and gold alloys jewellery artefacts fineness marking", "Metallurgical Engineering", "Commercial Trade"),
    ("hallmark", "IS:1417", "gold and gold alloys jewellery artefacts fineness marking", "Metallurgical Engineering", "Commercial Trade"),
    ("silver jewellery", "IS:2112", "silver and silver alloys jewellery artefacts fineness marking", "Metallurgical Engineering", "Commercial Trade"),
    ("सोना", "IS:1417", "gold and gold alloys jewellery artefacts fineness marking", "Metallurgical Engineering", "Hindi Colloquial"),
    ("हॉलमार्क", "IS:1417", "gold and gold alloys jewellery artefacts fineness marking", "Metallurgical Engineering", "Hindi Colloquial"),

    # Cement, Concrete, Mortar & Aggregates
    ("ready mix concrete", "IS:4926", "ready-mixed concrete code of practice", "Civil Engineering", "Trade Name"),
    ("ready-mix concrete", "IS:4926", "ready-mixed concrete code of practice", "Civil Engineering", "Trade Name"),
    ("ready mixed concrete", "IS:4926", "ready-mixed concrete code of practice", "Civil Engineering", "Trade Name"),
    ("ready-mixed concrete", "IS:4926", "ready-mixed concrete code of practice", "Civil Engineering", "Trade Name"),
    ("rmc", "IS:4926", "ready-mixed concrete code of practice", "Civil Engineering", "Trade Acronym"),
    ("cement concrete", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Engineering Term"),
    ("plain cement concrete", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Engineering Term"),
    ("rcc concrete", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Engineering Term"),
    ("m-10", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m-15", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m-20", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m-25", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m10", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m15", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m20", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m25", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Grade"),
    ("m-10 grade cement concrete", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Code"),
    ("m-15 grade plain cement concrete", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Code"),
    ("m-20 grade rcc concrete", "IS:456", "plain and reinforced concrete code of practice", "Civil Engineering", "Mix Code"),
    ("opc 43", "IS:269", "ordinary portland cement 43 grade specification harmonized into IS 269", "Civil Engineering", "Harmonized Spec"),
    ("opc 53", "IS:269", "ordinary portland cement 53 grade specification harmonized into IS 269", "Civil Engineering", "Harmonized Spec"),
    ("opc 43 grade", "IS:269", "ordinary portland cement 43 grade specification harmonized into IS 269", "Civil Engineering", "Harmonized Spec"),
    ("opc 53 grade", "IS:269", "ordinary portland cement 53 grade specification harmonized into IS 269", "Civil Engineering", "Harmonized Spec"),
    ("ordinary portland cement 53 grade", "IS:269", "ordinary portland cement 53 grade specification harmonized into IS 269", "Civil Engineering", "Harmonized Spec"),
    ("ordinary portland cement 43 grade", "IS:269", "ordinary portland cement 43 grade specification harmonized into IS 269", "Civil Engineering", "Harmonized Spec"),
    ("ordinary portland cement", "IS:269", "ordinary portland cement specification", "Civil Engineering", "Standard Spec"),
    ("ppc", "IS:1489:P1", "portland pozzolana cement", "Civil Engineering", "Trade Acronym"),
    ("सीमेंट", "IS:269", "ordinary portland cement 43 grade", "Civil Engineering", "Hindi Colloquial"),
    ("crushed sand", "IS:383", "coarse and fine aggregates from natural sources for concrete", "Civil Engineering", "GeM Category"),
    ("vsi grade", "IS:383", "coarse and fine aggregates from natural sources for concrete", "Civil Engineering", "Industry Term"),
    ("vsi sand", "IS:383", "coarse and fine aggregates from natural sources for concrete", "Civil Engineering", "Industry Term"),
    ("fine aggregate", "IS:383", "coarse and fine aggregates from natural sources for concrete", "Civil Engineering", "Standard Spec"),
    ("coarse aggregate", "IS:383", "coarse and fine aggregates from natural sources for concrete", "Civil Engineering", "Standard Spec"),
    ("chuna", "IS:712", "building lime", "Civil Engineering", "Hinglish Trade"),
    ("चूना", "IS:712", "building lime", "Civil Engineering", "Hindi Colloquial"),
    ("cement mortar", "IS:2250", "preparation and use of masonry mortars", "Civil Engineering", "Engineering Term"),
    ("masonry mortar", "IS:2250", "preparation and use of masonry mortars", "Civil Engineering", "Engineering Term"),

    # Fertilizer & Agricultural Chemicals
    ("fertilizer-grade urea", "IS:5406", "urea fertilizer grade specification", "Chemical", "Trade Name"),
    ("urea", "IS:5406", "urea fertilizer grade specification", "Chemical", "Trade Name"),

    # Testing Specifications
    ("testing of hardened concrete", "IS:516", "hardened concrete methods of test compressive strength", "Civil Engineering", "Testing Spec"),
    ("testing of hardened m-20 concrete", "IS:516", "hardened concrete methods of test compressive strength", "Civil Engineering", "Testing Spec"),
    ("testing of fine aggregate/sand", "IS:2386:P1", "methods of test for aggregates for concrete", "Civil Engineering", "Testing Spec"),
    ("testing of fine aggregate", "IS:2386:P1", "methods of test for aggregates for concrete", "Civil Engineering", "Testing Spec"),
    ("testing of coarse aggregate", "IS:2386:P1", "methods of test for aggregates for concrete", "Civil Engineering", "Testing Spec"),
    ("testing bricks supplied to the construction site", "IS:3495", "methods of tests of burnt clay building bricks compressive strength water absorption", "Civil Engineering", "Testing Spec"),
    ("testing bricks", "IS:3495", "methods of tests of burnt clay building bricks", "Civil Engineering", "Testing Spec"),
    ("testing of bricks", "IS:3495", "methods of tests of burnt clay building bricks", "Civil Engineering", "Testing Spec"),
    ("testing cement samples", "IS:4031:P1", "methods of physical tests for hydraulic cement", "Civil Engineering", "Testing Spec"),
    ("testing cement", "IS:4031:P1", "methods of physical tests for hydraulic cement", "Civil Engineering", "Testing Spec"),
    ("testing of cement", "IS:4031:P1", "methods of physical tests for hydraulic cement", "Civil Engineering", "Testing Spec"),
    ("testing vitrified ceramic tiles", "IS:13630:P1", "ceramic tiles methods of test sampling and basis of acceptance", "Civil Engineering", "Testing Spec"),

    # Masonry, Stone, Soling & Bricks
    ("masonry walls using common burnt clay building bricks", "IS:2212", "code of practice for brickwork", "Civil Engineering", "CPWD Spec"),
    ("brick masonry in cement mortar", "IS:2212", "code of practice for brickwork", "Civil Engineering", "CPWD Spec"),
    ("brick masonry", "IS:2212", "code of practice for brickwork", "Civil Engineering", "CPWD Spec"),
    ("fly ash brick", "IS:12894", "pulverized fuel ash-lime bricks", "Civil Engineering", "Trade Name"),
    ("fly ash bricks", "IS:12894", "pulverized fuel ash-lime bricks", "Civil Engineering", "Trade Name"),
    ("fly ash-lime bricks", "IS:12894", "pulverized fuel ash-lime bricks specification", "Civil Engineering", "Trade Name"),
    ("fly ash lime bricks", "IS:12894", "pulverized fuel ash-lime bricks specification", "Civil Engineering", "Trade Name"),
    ("fly ash brick masonry", "IS:12894", "pulverized fuel ash-lime bricks", "Civil Engineering", "CPWD Spec"),
    ("conventional clay bricks", "IS:1077", "common burnt clay building bricks specification", "Civil Engineering", "Standard Spec"),
    ("clay bricks of uniform size", "IS:1077", "common burnt clay building bricks specification", "Civil Engineering", "Standard Spec"),
    ("burnt clay brick", "IS:1077", "common burnt clay building bricks", "Civil Engineering", "Standard Spec"),
    ("burnt clay bricks", "IS:1077", "common burnt clay building bricks", "Civil Engineering", "Standard Spec"),
    ("dry rubble stone soling", "IS:10067", "materials in tender documents building works soling stone", "Civil Engineering", "CPWD Spec"),
    ("stone soling", "IS:10067", "materials in tender documents building works soling stone", "Civil Engineering", "CPWD Spec"),
    ("rubble stone soling", "IS:10067", "materials in tender documents building works soling stone", "Civil Engineering", "CPWD Spec"),
    ("rubble soling", "IS:10067", "materials in tender documents building works soling stone", "Civil Engineering", "CPWD Spec"),
    ("kota stone", "IS:1128", "limestone slab and tiles", "Civil Engineering", "Trade Name"),
    ("kota stone slab", "IS:1128", "limestone slab and tiles", "Civil Engineering", "Trade Name"),
    ("kota stone slabs", "IS:1128", "limestone slab and tiles", "Civil Engineering", "Trade Name"),
    ("marble slab", "IS:1130", "marble blocks slabs and tiles", "Civil Engineering", "Trade Name"),
    ("marble slabs", "IS:1130", "marble blocks slabs and tiles", "Civil Engineering", "Trade Name"),
    ("white marble", "IS:1130", "marble blocks slabs and tiles", "Civil Engineering", "Trade Name"),
    ("green marble", "IS:1130", "marble blocks slabs and tiles", "Civil Engineering", "Trade Name"),
    ("granite stone", "IS:14223:P1", "polished building stones granite and similar stones", "Civil Engineering", "Trade Name"),

    # Excavation & Earthwork
    ("foundation excavation", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork", "Civil Engineering", "CPWD Item"),
    ("excavation in foundation trenches", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork", "Civil Engineering", "CPWD Item"),
    ("mechanical excavation for building foundations", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork", "Civil Engineering", "CPWD Item"),
    ("mechanical excavation", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork", "Civil Engineering", "CPWD Item"),
    ("excavation", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork", "Civil Engineering", "CPWD Item"),
    ("filling in plinth", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork plinth filling", "Civil Engineering", "CPWD Item"),
    ("plinth filling", "IS:1200:P1", "methods of measurement of building and civil engineering works earthwork plinth filling", "Civil Engineering", "CPWD Item"),

    # Plaster, Paint, Waterproofing & Tiles
    ("cement mortar 1:4 for external plastering", "IS:1661", "code of practice for application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("cement mortar 1:3 for rendering uneven concrete", "IS:1661", "code of practice for application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("sand-faced plaster", "IS:1661", "application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("sand faced plaster", "IS:1661", "application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("external plastering", "IS:1661", "application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("external plaster", "IS:1661", "application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("external rendered finish", "IS:2402", "code of practice for external rendered finishes", "Civil Engineering", "CPWD Spec"),
    ("rendered finish", "IS:2402", "code of practice for external rendered finishes", "Civil Engineering", "CPWD Spec"),
    ("cement plaster in mortar 1:4 with waterproofing compound", "IS:1661", "application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("plaster", "IS:1661", "application of cement and cement-lime plaster finishes", "Civil Engineering", "CPWD Spec"),
    ("vitrified", "IS:15622", "pressed ceramic tiles specification", "Civil Engineering", "GeM Category"),
    ("vitrified tile", "IS:15622", "pressed ceramic tiles specification", "Civil Engineering", "GeM Category"),
    ("vitrified tiles", "IS:15622", "pressed ceramic tiles specification", "Civil Engineering", "GeM Category"),
    ("vitrified mirror", "IS:15622", "pressed ceramic tiles specification", "Civil Engineering", "Trade Description"),
    ("glossy finish ceramic tiles on floors", "IS:15622", "pressed ceramic tiles", "Civil Engineering", "CPWD Item"),
    ("ceramic tiles on floors", "IS:15622", "pressed ceramic tiles", "Civil Engineering", "CPWD Item"),
    ("ceramic glazed floor tiles", "IS:15622", "pressed ceramic tiles", "Civil Engineering", "CPWD Item"),
    ("ceramic glazed wall tiles", "IS:15622", "pressed ceramic tiles", "Civil Engineering", "CPWD Item"),
    ("tile adhesive", "IS:15477", "adhesives for use with ceramic tiles and mosaics", "Civil Engineering", "Trade Product"),
    ("cement paint", "IS:5410", "cement paint specification", "Chemical", "GeM Category"),
    ("waterproof cement paint", "IS:5410", "cement paint specification", "Chemical", "GeM Category"),
    ("water proofing cement compound", "IS:2645", "integral waterproofing compounds for cement mortar and concrete", "Civil Engineering", "Trade Product"),
    ("waterproofing compound", "IS:2645", "integral waterproofing compounds for cement mortar and concrete", "Civil Engineering", "Trade Product"),
    ("dry colour distemper", "IS:427", "distemper dry colour as required specification", "Chemical", "Trade Product"),
    ("dry distemper", "IS:427", "distemper dry colour as required specification", "Chemical", "Trade Product"),
    ("distemper", "IS:427", "distemper dry colour as required specification", "Chemical", "Trade Product"),
    ("washable distemper", "IS:428", "washable distemper specification", "Chemical", "Trade Product"),
    ("acrylic distemper", "IS:428", "washable distemper specification", "Chemical", "Trade Product"),
    ("synthetic enamel", "IS:9034", "synthetic enamel exterior", "Chemical", "Trade Product"),
    ("synthetic enamel paint", "IS:9034", "synthetic enamel exterior", "Chemical", "Trade Product"),
    ("red oxide primer", "IS:11883", "ready mixed paint red oxide primer", "Chemical", "Trade Product"),
    ("aluminium primer", "IS:3585", "ready mixed paint aluminium primer for resinous wood", "Chemical", "Trade Product"),
    ("gypsum plaster/plaster of paris", "IS:2547:P1", "gypsum building plaster specification", "Civil Engineering", "Trade Name"),
    ("plaster of paris", "IS:2547:P1", "gypsum building plaster specification", "Civil Engineering", "Trade Name"),
    ("gypsum plaster", "IS:2547:P1", "gypsum building plaster specification", "Civil Engineering", "Trade Name"),
    ("acrylic sheet", "IS:14753", "polymethyl methacrylate pmma acrylic sheets", "Chemical", "Trade Product"),
    ("acrylic sheets", "IS:14753", "polymethyl methacrylate pmma acrylic sheets", "Chemical", "Trade Product"),

    # Pipes, Valves & Plumbing
    ("pvc pipe", "IS:4985", "unplasticized pvc pipes for potable water supplies", "Civil Engineering", "Trade Name"),
    ("pvc pipes", "IS:4985", "unplasticized pvc pipes for potable water supplies", "Civil Engineering", "Trade Name"),
    ("gi steel pipes for water supply", "IS:1239:P1", "steel tubes tubulars and other wrought steel fittings mild steel tubes", "Civil Engineering", "Standard Spec"),
    ("gi steel pipes", "IS:1239:P1", "steel tubes tubulars and other wrought steel fittings mild steel tubes", "Civil Engineering", "Standard Spec"),
    ("gi pipes", "IS:1239:P1", "steel tubes tubulars and other wrought steel fittings mild steel tubes", "Civil Engineering", "Standard Spec"),
    ("gi pipe", "IS:1239:P1", "steel tubes tubulars and other wrought steel fittings mild steel tubes", "Civil Engineering", "Standard Spec"),
    ("cpvc pipes for hot and cold potable water", "IS:15778", "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water supplies", "Civil Engineering", "Standard Spec"),
    ("cpvc pipes", "IS:15778", "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water supplies", "Civil Engineering", "Standard Spec"),
    ("cpvc pipe", "IS:15778", "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water supplies", "Civil Engineering", "Standard Spec"),
    ("chlorinated polyvinyl chloride", "IS:15778", "chlorinated polyvinyl chloride cpvc pipes for potable hot and cold water supplies", "Civil Engineering", "Technical Name"),
    ("rigid pvc pipe", "IS:13592", "upvc pipes for soil and waste discharge systems", "Civil Engineering", "Trade Name"),
    ("rigid pvc pipes", "IS:13592", "upvc pipes for soil and waste discharge systems", "Civil Engineering", "Trade Name"),
    ("sluice valve", "IS:14846", "sluice valve for water works purposes", "Mechanical Engineering", "Trade Name"),
    ("gate valve", "IS:14846", "sluice valve for water works purposes", "Mechanical Engineering", "Trade Name"),
    ("wash basin", "IS:2556:P4", "vitreous sanitary appliances specific requirements of wash basins", "Civil Engineering", "GeM Category"),
    ("wash-basin", "IS:2556:P4", "vitreous sanitary appliances specific requirements of wash basins", "Civil Engineering", "GeM Category"),
    ("flat back wash basin", "IS:2556:P4", "vitreous sanitary appliances specific requirements of wash basins", "Civil Engineering", "GeM Category"),
    ("squatting pan", "IS:2556:P3", "vitreous sanitary appliances specific requirements of squatting pans", "Civil Engineering", "GeM Category"),
    ("orissa pattern", "IS:2556:P3", "vitreous sanitary appliances specific requirements of squatting pans", "Civil Engineering", "GeM Category"),
    ("flushing cistern", "IS:7231", "plastic flushing cisterns for water closets", "Civil Engineering", "GeM Category"),
    ("pvc flushing cistern", "IS:7231", "plastic flushing cisterns for water closets", "Civil Engineering", "GeM Category"),
    ("kitchen sink", "IS:13983", "stainless steel sinks for domestic purposes", "Civil Engineering", "GeM Category"),
    ("stainless steel sink", "IS:13983", "stainless steel sinks for domestic purposes", "Civil Engineering", "GeM Category"),

    # Doors, Windows & Hardware
    ("flush door", "IS:2202:P1", "wooden flush door shutters solid core", "Civil Engineering", "Trade Name"),
    ("flush door shutter", "IS:2202:P1", "wooden flush door shutters solid core", "Civil Engineering", "Trade Name"),
    ("flush door shutters", "IS:2202:P1", "wooden flush door shutters solid core", "Civil Engineering", "Trade Name"),
    ("door handle", "IS:4992", "door handles for mortice lock vertical type", "Civil Engineering", "Trade Product"),
    ("door handles", "IS:4992", "door handles for mortice lock vertical type", "Civil Engineering", "Trade Product"),
    ("m.s. handle", "IS:4992", "door handles for mortice lock vertical type", "Civil Engineering", "Trade Product"),
    ("m.s. handles", "IS:4992", "door handles for mortice lock vertical type", "Civil Engineering", "Trade Product"),
    ("casement stay", "IS:10019", "mild steel stays and fasteners", "Civil Engineering", "Trade Product"),
    ("casement stays", "IS:10019", "mild steel stays and fasteners", "Civil Engineering", "Trade Product"),
    ("sliding door bolt", "IS:2681", "non-ferrous metal sliding door bolts aldrops for padlocks", "Civil Engineering", "Trade Product"),
    ("sliding door bolts", "IS:2681", "non-ferrous metal sliding door bolts aldrops for padlocks", "Civil Engineering", "Trade Product"),
    ("tower bolt", "IS:204:P2", "tower bolts non-ferrous metals", "Civil Engineering", "Trade Product"),
    ("tower bolts", "IS:204:P2", "tower bolts non-ferrous metals", "Civil Engineering", "Trade Product"),
    ("door stopper", "IS:1823", "floor door stoppers", "Civil Engineering", "Trade Product"),
    ("pressed steel door frame", "IS:4351", "steel door frames", "Civil Engineering", "Trade Product"),
    ("pressed steel door frames", "IS:4351", "steel door frames", "Civil Engineering", "Trade Product"),
    ("plywood", "IS:303", "plywood for general purposes", "Civil Engineering", "Trade Product"),

    # Pumps, Motors & Mechanical
    ("pani ki motor", "IS:8034", "submersible pumpsets for clear cold water", "Mechanical Engineering", "Hinglish Trade"),
    ("submersible pump", "IS:8034", "submersible pumpsets for clear cold water", "Mechanical Engineering", "Trade Name"),
    ("submersible pumpset", "IS:8034", "submersible pumpsets for clear cold water", "Mechanical Engineering", "Trade Name"),
    ("submersible", "IS:8034", "submersible pumpsets for clear cold water", "Mechanical Engineering", "Trade Name"),
    ("monoset pump", "IS:9079", "monoset pumps for clear cold fresh water", "Mechanical Engineering", "Trade Name"),
    ("monobloc pump", "IS:9079", "monoset pumps for clear cold fresh water", "Mechanical Engineering", "Trade Name"),
    ("monobloc", "IS:9079", "monoset pumps for clear cold fresh water", "Mechanical Engineering", "Trade Name"),
    ("diesel engine", "IS:10001", "constant speed compression ignition diesel engines", "Mechanical Engineering", "Trade Name"),
    ("पानी की मोटर", "IS:8034", "submersible pumpsets for clear cold water", "Mechanical Engineering", "Hindi Colloquial"),
    ("सबमर्सिबल", "IS:8034", "submersible pumpsets for clear cold water", "Mechanical Engineering", "Hindi Colloquial"),

    # Electrical, Electronics & IT
    ("energy efficient motor", "IS:12615", "line operated three phase ac motors efficiency classes", "Electrotechnical", "Trade Category"),
    ("energy efficient induction motor", "IS:12615", "line operated three phase ac motors efficiency classes", "Electrotechnical", "Trade Category"),
    ("ceiling fan", "IS:374", "electric ceiling type fans and regulators", "Electrotechnical", "GeM Category"),
    ("पंखा", "IS:374", "electric ceiling type fans and regulators", "Electrotechnical", "Hindi Colloquial"),
    ("led bulb", "IS:16102:P1", "self-ballasted led lamps for general lighting", "Electrotechnical", "GeM Category"),
    ("led luminaire", "IS:10322:P5:S3", "luminaires for road and street lighting", "Electrotechnical", "GeM Category"),
    ("transformer", "IS:1180:P1", "outdoor distribution transformers", "Electrotechnical", "Trade Category"),
    ("ट्रांसफॉर्मर", "IS:1180:P1", "outdoor distribution transformers", "Electrotechnical", "Hindi Colloquial"),
    ("static watt-hour", "IS:13779", "ac static watt-hour energy meters", "Electrotechnical", "Technical Category"),
    ("pvc cable", "IS:694", "pvc insulated unsheathed-and-sheathed cables", "Electrotechnical", "Trade Category"),
    ("pvc insulated cable", "IS:694", "pvc insulated unsheathed-and-sheathed cables", "Electrotechnical", "Trade Category"),
    ("pvc insulated electrical cables for internal wiring", "IS:694", "polyvinyl chloride insulated cables for voltages up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("pvc insulated cables for internal wiring", "IS:694", "polyvinyl chloride insulated cables for voltages up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("internal wiring", "IS:694", "polyvinyl chloride insulated cables for voltages up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("pvc insulated and sheathed cables for electrical installations", "IS:1554:P1", "pvc insulated heavy duty electric cables", "Electrotechnical", "Standard Spec"),
    ("pvc insulated and sheathed cables", "IS:1554:P1", "pvc insulated heavy duty electric cables", "Electrotechnical", "Standard Spec"),
    ("cctv", "IS:13252:P1", "information technology equipment safety", "Electronics and IT", "Trade Acronym"),
    ("cctv camera", "IS:13252:P1", "information technology equipment safety", "Electronics and IT", "Trade Name"),
    ("cctv cameras", "IS:13252:P1", "information technology equipment safety", "Electronics and IT", "Trade Name"),
    ("laptop", "IS:13252:P1", "laptop notebook computers", "Electronics and IT", "GeM Category"),
    ("ups", "IS:16242:P1", "uninterruptible power systems", "Electrotechnical", "Trade Acronym"),
    ("uninterruptible power", "IS:16242:P1", "uninterruptible power systems", "Electrotechnical", "Trade Name"),

    # Safety, Medical & Chemicals
    ("safety shoe", "IS:15298:P2", "personal protective equipment safety footwear", "Chemical", "GeM Category"),
    ("safety footwear", "IS:15298:P2", "personal protective equipment safety footwear", "Chemical", "GeM Category"),
    ("सुरक्षा जूते", "IS:15298:P2", "personal protective equipment safety footwear", "Chemical", "Hindi Colloquial"),
    ("safety helmet", "IS:2925", "industrial safety helmets", "Civil Engineering", "GeM Category"),
    ("सुरक्षा हेलमेट", "IS:2925", "industrial safety helmets", "Civil Engineering", "Hindi Colloquial"),
    ("fire extinguisher", "IS:15683", "portable fire extinguishers", "Civil Engineering", "GeM Category"),
    ("अग्निशामक", "IS:15683", "portable fire extinguishers", "Civil Engineering", "Hindi Colloquial"),
    ("water purifier", "IS:16240", "point of use water purifiers", "Water Resources", "GeM Category"),
    ("packaged water", "IS:14543", "packaged drinking water other than natural mineral water", "Food and Agriculture", "Trade Product"),
    ("packaged drinking water", "IS:14543", "packaged drinking water other than natural mineral water", "Food and Agriculture", "Trade Product"),
    ("mineral water", "IS:13428", "packaged natural mineral water", "Food and Agriculture", "Trade Product"),
    ("surgical glove", "IS:13422", "sterile surgical rubber gloves disposable", "Medical and Healthcare", "GeM Category"),
    ("surgical gloves", "IS:13422", "sterile surgical rubber gloves disposable", "Medical and Healthcare", "GeM Category"),
    ("rubber glove", "IS:13422", "sterile surgical rubber gloves disposable", "Medical and Healthcare", "GeM Category"),
    ("rubber gloves", "IS:13422", "sterile surgical rubber gloves disposable", "Medical and Healthcare", "GeM Category"),
    ("digital clinical thermometers", "IS:15113", "clinical electrical thermometers with maximum device", "Medical and Healthcare", "GeM Category"),
    ("digital clinical thermometer", "IS:15113", "clinical electrical thermometers with maximum device", "Medical and Healthcare", "GeM Category"),
    ("digital thermometer", "IS:15113", "clinical electrical thermometers with maximum device", "Medical and Healthcare", "GeM Category"),
    ("fertilizer grade urea", "IS:5406", "urea fertilizer grade", "Chemical", "GeM Category"),
    ("sanitary pad", "IS:5405", "sanitary napkins", "Textiles", "GeM Category"),
    ("bleaching powder", "IS:1065", "bleaching powder stable", "Chemical", "GeM Category"),
    ("stable bleaching powder", "IS:1065", "bleaching powder stable", "Chemical", "GeM Category"),
    ("surgical mask", "IS:16289", "medical face masks surgical masks", "Medical and Healthcare", "GeM Category"),
    ("medical face mask", "IS:16289", "medical face masks surgical masks", "Medical and Healthcare", "GeM Category"),
    ("hypodermic syringe", "IS:10258", "sterile hypodermic syringes for single use", "Medical and Healthcare", "GeM Category"),
    ("liquid nitrogen", "IS:1747", "nitrogen compressed gas and liquid specification", "Chemical", "Industrial Gas"),
    ("compressed nitrogen", "IS:1747", "nitrogen compressed gas and liquid specification", "Chemical", "Industrial Gas"),
    ("cryogenic liquid", "IS:5931", "code of safety for handling cryogenic liquids", "Chemical", "Safety Code"),
    ("cryogenic tank", "IS:2825", "code for unfired pressure vessels", "Mechanical Engineering", "Engineering Equipment"),
    ("cryogenic vessel", "IS:11552", "liquid nitrogen vessels", "Chemical", "Equipment"),
    ("watch and ward", "IS/ISO:9001", "quality management systems for security services", "Management and Systems", "Service Archetype"),

    # Testing Methods
    ("testing for concrete", "IS:516", "hardened concrete methods of test", "Civil Engineering", "Testing Standard"),
    ("testing of concrete", "IS:516", "hardened concrete methods of test", "Civil Engineering", "Testing Standard"),
    ("m20 concrete testing", "IS:516", "hardened concrete methods of test", "Civil Engineering", "Testing Standard"),
    ("testing of sand", "IS:2386:P1", "methods of test for aggregates for concrete", "Civil Engineering", "Testing Standard"),
    ("testing is specified for sand and m20 concrete", "IS:516", "hardened concrete methods of test", "Civil Engineering", "Testing Standard"),
    ("testing for sand and m20 concrete", "IS:516", "hardened concrete methods of test", "Civil Engineering", "Testing Standard")
]


def run_migration(db_path: str = DB_PATH):
    print(f"Connecting to {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Ensure standard_aliases table exists
    cur.execute("""
    CREATE TABLE IF NOT EXISTS standard_aliases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alias_term TEXT NOT NULL UNIQUE,
        family_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        division TEXT,
        source TEXT DEFAULT 'OFFICIAL_TRADE_CATALOGUE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(family_id) REFERENCES standards(family_id)
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_alias_term ON standard_aliases(alias_term);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_alias_family ON standard_aliases(family_id);")

    # 2. Insert or replace seed aliases
    inserted = 0
    for term, fid, prod, div, src in SEED_ALIASES:
        cur.execute("""
        INSERT OR REPLACE INTO standard_aliases (alias_term, family_id, product_name, division, source)
        VALUES (?, ?, ?, ?, ?);
        """, (term.strip().lower(), fid, prod, div, src))
        inserted += 1

    # 3. Create virtual table aliases_fts for instant SQLite full-text search over aliases
    cur.execute("DROP TABLE IF EXISTS aliases_fts;")
    cur.execute("""
    CREATE VIRTUAL TABLE aliases_fts USING fts5(
        alias_term,
        product_name,
        family_id,
        division
    );
    """)

    cur.execute("""
    INSERT INTO aliases_fts (alias_term, product_name, family_id, division)
    SELECT alias_term, product_name, family_id, division FROM standard_aliases;
    """)

    conn.commit()
    cur.execute("SELECT COUNT(*) FROM standard_aliases;")
    count = cur.fetchone()[0]
    conn.close()
    print(f"Success! Migrated {count} trade and procurement aliases into persistent SQLite table & FTS index.")


populate_aliases = run_migration

if __name__ == "__main__":
    run_migration()
