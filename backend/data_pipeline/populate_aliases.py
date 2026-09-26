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
    ("testing for sand and m20 concrete", "IS:516", "hardened concrete methods of test", "Civil Engineering", "Testing Standard"),

    # Civil Infrastructure & Road Pavements
    ("shotcrete", "IS:9012", "recommended practice for shotcreting", "Civil Engineering", "Standard Spec"),
    ("gunite", "IS:9012", "recommended practice for shotcreting", "Civil Engineering", "Trade Name"),
    ("guniting", "IS:9012", "recommended practice for shotcreting", "Civil Engineering", "Trade Name"),
    ("prestressed concrete", "IS:1343", "code of practice for prestressed concrete", "Civil Engineering", "Standard Spec"),
    ("prestressed concrete beam", "IS:1343", "code of practice for prestressed concrete", "Civil Engineering", "Standard Spec"),
    ("prestressed concrete sleeper", "IS:1343", "code of practice for prestressed concrete", "Civil Engineering", "Standard Spec"),
    ("raft foundation", "IS:2950:P1", "code of practice for design and construction of raft foundations", "Civil Engineering", "Standard Spec"),
    ("site clearance", "IS:1200:P1", "method of measurement of building and civil engineering works - earthwork", "Civil Engineering", "Standard Spec"),
    ("topsoil stripping", "IS:1200:P1", "method of measurement of building and civil engineering works - earthwork", "Civil Engineering", "Standard Spec"),
    ("earth filling", "IS:1200:P1", "method of measurement of building and civil engineering works - earthwork", "Civil Engineering", "Standard Spec"),
    ("sand filling", "IS:1200:P1", "method of measurement of building and civil engineering works - earthwork", "Civil Engineering", "Standard Spec"),
    ("dense bituminous macadam", "IS:73", "paving bitumen for bituminous macadam and road construction", "Civil Engineering", "Highway Standard"),
    ("bituminous macadam", "IS:73", "paving bitumen for bituminous macadam and road construction", "Civil Engineering", "Highway Standard"),
    ("bituminous concrete", "IS:73", "paving bitumen for bituminous macadam and road construction", "Civil Engineering", "Highway Standard"),
    ("wet mix macadam", "IS:383", "coarse and fine aggregates for wet mix macadam road base", "Civil Engineering", "Highway Standard"),
    ("water bound macadam", "IS:383", "coarse and fine aggregates for water bound macadam road base", "Civil Engineering", "Highway Standard"),
    ("granular sub-base", "IS:383", "coarse and fine aggregates for granular sub-base road construction", "Civil Engineering", "Highway Standard"),
    ("prime coat", "IS:8887", "cationic bitumen emulsion for prime coat", "Civil Engineering", "Highway Standard"),
    ("tack coat", "IS:8887", "cationic bitumen emulsion for tack coat", "Civil Engineering", "Highway Standard"),

    # Specialized Concrete & Grouting
    ("high-strength concrete", "IS:10262", "concrete mix proportioning guidelines - high strength concrete", "Civil Engineering", "Standard Spec"),
    ("high strength concrete", "IS:10262", "concrete mix proportioning guidelines - high strength concrete", "Civil Engineering", "Standard Spec"),
    ("lightweight concrete", "IS:2185:P2", "concrete masonry units - lightweight aggregate concrete blocks", "Civil Engineering", "Standard Spec"),
    ("non-shrink cementitious grout", "IS:4031:P1", "methods of physical tests for hydraulic cement and grout", "Civil Engineering", "Standard Spec"),
    ("non-shrink grout", "IS:4031:P1", "methods of physical tests for hydraulic cement and grout", "Civil Engineering", "Standard Spec"),
    ("concrete surface hardener", "IS:2571", "code of practice for in-situ cement concrete and surface hardened flooring", "Civil Engineering", "Standard Spec"),
    ("pcc 1:4:8", "IS:456", "plain and reinforced concrete code of practice - nominal mixes", "Civil Engineering", "Standard Spec"),
    ("pcc 1:3:6", "IS:456", "plain and reinforced concrete code of practice - nominal mixes", "Civil Engineering", "Standard Spec"),
    ("lean concrete", "IS:456", "plain and reinforced concrete code of practice - foundation bedding", "Civil Engineering", "Standard Spec"),
    ("concrete curing compound", "IS:18256", "liquid membrane forming compounds for curing concrete", "Civil Engineering", "Standard Spec"),

    # Masonry Blocks, Stonework & Flooring
    ("aac block masonry", "IS:6041", "code of practice for construction of autoclaved cellular concrete block masonry", "Civil Engineering", "Standard Spec"),
    ("autoclaved aerated concrete blocks", "IS:2185:P3", "concrete masonry units - autoclaved cellular aerated concrete blocks", "Civil Engineering", "Standard Spec"),
    ("aac blocks", "IS:2185:P3", "concrete masonry units - autoclaved cellular aerated concrete blocks", "Civil Engineering", "Standard Spec"),
    ("aac block", "IS:2185:P3", "concrete masonry units - autoclaved cellular aerated concrete blocks", "Civil Engineering", "Standard Spec"),
    ("concrete hollow blocks", "IS:2185:P1", "concrete masonry units - hollow and solid concrete blocks", "Civil Engineering", "Standard Spec"),
    ("solid concrete masonry blocks", "IS:2185:P1", "concrete masonry units - hollow and solid concrete blocks", "Civil Engineering", "Standard Spec"),
    ("hollow concrete blocks", "IS:2185:P1", "concrete masonry units - hollow and solid concrete blocks", "Civil Engineering", "Standard Spec"),
    ("solid concrete blocks", "IS:2185:P1", "concrete masonry units - hollow and solid concrete blocks", "Civil Engineering", "Standard Spec"),
    ("fly ash cement blocks", "IS:12894", "pulverized fuel ash lime bricks and blocks", "Civil Engineering", "Standard Spec"),
    ("ips flooring", "IS:2571", "code of practice for laying in-situ cement concrete flooring indian patent stone", "Civil Engineering", "Standard Spec"),
    ("cement screed flooring", "IS:2571", "code of practice for laying in-situ cement concrete flooring", "Civil Engineering", "Standard Spec"),
    ("cement screed", "IS:2571", "code of practice for laying in-situ cement concrete flooring", "Civil Engineering", "Standard Spec"),
    ("terrazzo flooring", "IS:2114", "laying in-situ terrazzo floor finish code of practice", "Civil Engineering", "Standard Spec"),
    ("marble flooring", "IS:1130", "marble blocks slabs and tiles for flooring", "Civil Engineering", "Standard Spec"),
    ("cement render to external walls", "IS:2402", "code of practice for external rendered finishes", "Civil Engineering", "Standard Spec"),
    ("brick lintels", "IS:2212", "code of practice for brickwork - brick lintels", "Civil Engineering", "Standard Spec"),

    # Doors, Windows, Hardware & Roofing
    ("steel windows", "IS:1038", "specification for steel doors windows and ventilators", "Civil Engineering", "Standard Spec"),
    ("steel window", "IS:1038", "specification for steel doors windows and ventilators", "Civil Engineering", "Standard Spec"),
    ("wooden panel doors", "IS:1003:P1", "timber panelled and glazed shutters - door shutters", "Civil Engineering", "Standard Spec"),
    ("wooden panel door", "IS:1003:P1", "timber panelled and glazed shutters - door shutters", "Civil Engineering", "Standard Spec"),
    ("wooden glazed doors", "IS:1003:P1", "timber panelled and glazed shutters - door shutters", "Civil Engineering", "Standard Spec"),
    ("wooden glazed door", "IS:1003:P1", "timber panelled and glazed shutters - door shutters", "Civil Engineering", "Standard Spec"),
    ("fire-rated steel doors", "IS:3614", "fire doors and doorsets specification", "Civil Engineering", "Standard Spec"),
    ("fire-rated wooden doors", "IS:3614", "fire doors and doorsets specification", "Civil Engineering", "Standard Spec"),
    ("toughened glass for doors", "IS:2553:P1", "safety glass - general purpose toughened glass", "Civil Engineering", "Standard Spec"),
    ("laminated safety glass", "IS:2553:P1", "safety glass - general purpose laminated glass", "Civil Engineering", "Standard Spec"),
    ("wired glass panels", "IS:5437", "wired glasses specification", "Civil Engineering", "Standard Spec"),
    ("aluminium door handles", "IS:208", "door handles specification", "Civil Engineering", "Standard Spec"),
    ("door handles", "IS:208", "door handles specification", "Civil Engineering", "Standard Spec"),
    ("aluminium roofing sheets", "IS:1254", "corrugated aluminium sheet", "Civil Engineering", "Standard Spec"),
    ("fibre cement roofing sheets", "IS:459", "corrugated and semi-corrugated asbestos cement sheets", "Civil Engineering", "Standard Spec"),
    ("fiber cement roofing sheets", "IS:459", "corrugated and semi-corrugated asbestos cement sheets", "Civil Engineering", "Standard Spec"),
    ("roof gutters and downpipes", "IS:2527", "code of practice for fixing of rainwater gutters and downpipes", "Civil Engineering", "Standard Spec"),
    ("glass wool insulation", "IS:8183", "bonded mineral wool for thermal insulation", "Civil Engineering", "Standard Spec"),
    ("glass wool", "IS:8183", "bonded mineral wool for thermal insulation", "Civil Engineering", "Standard Spec"),
    ("polycarbonate roofing sheets", "IS:14434", "polycarbonate moulding and extrusion sheet materials", "Civil Engineering", "Standard Spec"),

    # Pumps, Fire Protection & HVAC (MEP)
    ("fire fighting pump", "IS:12469", "specification for pumps for fire fighting system", "Mechanical Engineering", "Standard Spec"),
    ("fire pump", "IS:12469", "specification for pumps for fire fighting system", "Mechanical Engineering", "Standard Spec"),
    ("diesel engine driven fire pump", "IS:12469", "specification for pumps for fire fighting system", "Mechanical Engineering", "Standard Spec"),
    ("jockey pump", "IS:12469", "specification for pumps for fire fighting system", "Mechanical Engineering", "Standard Spec"),
    ("fire hydrant landing valve", "IS:5290", "specification for landing valves", "Civil Engineering", "Standard Spec"),
    ("landing valve", "IS:5290", "specification for landing valves", "Civil Engineering", "Standard Spec"),
    ("fire hose", "IS:636", "non-percolating flexible fire fighting delivery hose", "Civil Engineering", "Standard Spec"),
    ("fire delivery hose", "IS:636", "non-percolating flexible fire fighting delivery hose", "Civil Engineering", "Standard Spec"),
    ("fire hose reel", "IS:884", "specification for first-aid hose-reel for fire fighting", "Civil Engineering", "Standard Spec"),
    ("hose reel", "IS:884", "specification for first-aid hose-reel for fire fighting", "Civil Engineering", "Standard Spec"),
    ("wet riser system", "IS:3844", "code of practice for installation and maintenance of internal fire hydrants and hose reels on premises", "Civil Engineering", "Standard Spec"),
    ("dry riser system", "IS:3844", "code of practice for installation and maintenance of internal fire hydrants and hose reels on premises", "Civil Engineering", "Standard Spec"),
    ("wet riser", "IS:3844", "code of practice for installation and maintenance of internal fire hydrants and hose reels on premises", "Civil Engineering", "Standard Spec"),
    ("dry riser", "IS:3844", "code of practice for installation and maintenance of internal fire hydrants and hose reels on premises", "Civil Engineering", "Standard Spec"),
    ("fire extinguishing piping", "IS:3844", "code of practice for installation and maintenance of internal fire hydrants and hose reels on premises", "Civil Engineering", "Standard Spec"),
    ("air handling unit", "IS:8148", "packaged air conditioners specification - ahu", "Mechanical Engineering", "Standard Spec"),
    ("ahu", "IS:8148", "packaged air conditioners specification - ahu", "Mechanical Engineering", "Standard Spec"),
    ("vrf air conditioning system", "IS:8148", "packaged air conditioners specification - vrf systems", "Mechanical Engineering", "Standard Spec"),
    ("vrf system", "IS:8148", "packaged air conditioners specification - vrf systems", "Mechanical Engineering", "Standard Spec"),
    ("chilled water air conditioning system", "IS:16590", "liquid chilling package units specification", "Mechanical Engineering", "Standard Spec"),
    ("air-cooled chiller", "IS:16590", "liquid chilling package units specification", "Mechanical Engineering", "Standard Spec"),
    ("water-cooled chiller", "IS:16590", "liquid chilling package units specification", "Mechanical Engineering", "Standard Spec"),
    ("centrifugal ventilation fan", "IS:4894", "centrifugal fans specification", "Electrotechnical", "Standard Spec"),
    ("centrifugal fan", "IS:4894", "centrifugal fans specification", "Electrotechnical", "Standard Spec"),
    ("axial flow ventilation fan", "IS:3588", "electric axial flow fans specification", "Electrotechnical", "Standard Spec"),
    ("axial fan", "IS:3588", "electric axial flow fans specification", "Electrotechnical", "Standard Spec"),
    ("smoke extraction fan", "IS:4894", "centrifugal and axial fans for ventilation and smoke extraction", "Electrotechnical", "Standard Spec"),
    ("kitchen exhaust hood", "IS:4894", "fans and ventilation systems for kitchen exhaust", "Electrotechnical", "Standard Spec"),
    ("thermal insulation for hvac ducts", "IS:8183", "bonded mineral wool for thermal insulation of hvac ducts", "Civil Engineering", "Standard Spec"),
    ("acoustic duct insulation", "IS:8183", "bonded mineral wool for acoustic and thermal duct insulation", "Civil Engineering", "Standard Spec"),
    ("air filters for hvac systems", "IS:7613", "method of testing panel type air filters for air conditioning and ventilation purposes", "Mechanical Engineering", "Standard Spec"),
    ("air filter for hvac", "IS:7613", "method of testing panel type air filters for air conditioning and ventilation purposes", "Mechanical Engineering", "Standard Spec"),
    ("booster pump set", "IS:8034", "submersible and pressure booster pumpsets", "Mechanical Engineering", "Standard Spec"),
    ("pressure booster system", "IS:8034", "submersible and pressure booster pumpsets", "Mechanical Engineering", "Standard Spec"),
    ("sewage submersible pump", "IS:8034", "submersible pumpsets for clear cold water and drainage", "Mechanical Engineering", "Standard Spec"),
    ("drainage sump pump", "IS:8034", "submersible pumpsets for drainage and sump pumping", "Mechanical Engineering", "Standard Spec"),
    ("fire water storage tank", "IS:3844", "internal fire hydrants, hose reels and static water storage tanks for premises", "Civil Engineering", "Standard Spec"),

    # Electrical & Power Distribution (Electrotechnical)
    ("pvc insulated copper wires", "IS:694", "pvc insulated unsheathed and sheathed cables cords for electrical wiring", "Electrotechnical", "Standard Spec"),
    ("pvc insulated copper wire", "IS:694", "pvc insulated unsheathed and sheathed cables cords for electrical wiring", "Electrotechnical", "Standard Spec"),
    ("pvc insulated aluminium wires", "IS:694", "pvc insulated unsheathed and sheathed cables cords for electrical wiring", "Electrotechnical", "Standard Spec"),
    ("pvc insulated aluminium wire", "IS:694", "pvc insulated unsheathed and sheathed cables cords for electrical wiring", "Electrotechnical", "Standard Spec"),
    ("flexible electrical cables", "IS:694", "polyvinyl chloride insulated flexible cords and cables", "Electrotechnical", "Standard Spec"),
    ("flexible electrical cable", "IS:694", "polyvinyl chloride insulated flexible cords and cables", "Electrotechnical", "Standard Spec"),
    ("xlpe insulated power cables", "IS:7098:P1", "crosslinked polyethylene insulated pvc sheathed cables for working voltage up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("xlpe insulated power cable", "IS:7098:P1", "crosslinked polyethylene insulated pvc sheathed cables for working voltage up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("xlpe power cables", "IS:7098:P1", "crosslinked polyethylene insulated pvc sheathed cables for working voltage up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("xlpe armoured power cables", "IS:7098:P1", "crosslinked polyethylene insulated armoured power cables", "Electrotechnical", "Standard Spec"),
    ("xlpe armoured power cable", "IS:7098:P1", "crosslinked polyethylene insulated armoured power cables", "Electrotechnical", "Standard Spec"),
    ("pvc armoured power cables", "IS:1554:P1", "pvc insulated heavy duty electric cables for working voltages up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("pvc armoured power cable", "IS:1554:P1", "pvc insulated heavy duty electric cables for working voltages up to 1100 v", "Electrotechnical", "Standard Spec"),
    ("underground power cables", "IS:7098:P1", "crosslinked polyethylene insulated pvc sheathed cables for underground power distribution", "Electrotechnical", "Standard Spec"),
    ("underground power cable", "IS:7098:P1", "crosslinked polyethylene insulated pvc sheathed cables for underground power distribution", "Electrotechnical", "Standard Spec"),
    ("control cables", "IS:1554:P1", "pvc insulated heavy duty electric cables for control circuits", "Electrotechnical", "Standard Spec"),
    ("control cable", "IS:1554:P1", "pvc insulated heavy duty electric cables for control circuits", "Electrotechnical", "Standard Spec"),
    ("instrumentation cables", "IS:1554:P1", "pvc insulated electric cables for instrumentation", "Electrotechnical", "Standard Spec"),
    ("instrumentation cable", "IS:1554:P1", "pvc insulated electric cables for instrumentation", "Electrotechnical", "Standard Spec"),
    ("fire-resistant electrical cables", "IS:17505:P1", "fire survival cables with low smoke halogen free", "Electrotechnical", "Standard Spec"),
    ("fire resistant electrical cables", "IS:17505:P1", "fire survival cables with low smoke halogen free", "Electrotechnical", "Standard Spec"),
    ("low-smoke zero-halogen cables", "IS:17505:P1", "fire survival low smoke halogen free cables", "Electrotechnical", "Standard Spec"),
    ("low smoke zero halogen cables", "IS:17505:P1", "fire survival low smoke halogen free cables", "Electrotechnical", "Standard Spec"),
    ("telephone cables", "IS:10242:P3:S24", "shipboard and telecommunication cables telephone cables", "Electrotechnical", "Standard Spec"),
    ("telephone cable", "IS:10242:P3:S24", "shipboard and telecommunication cables telephone cables", "Electrotechnical", "Standard Spec"),
    ("coaxial cables", "IS:11967", "radio frequency coaxial cables", "Electronics and IT", "Standard Spec"),
    ("coaxial cable", "IS:11967", "radio frequency coaxial cables", "Electronics and IT", "Standard Spec"),
    ("optical fibre cables", "IS:13882:P1", "optical fibre cables generic specification", "Electronics and IT", "Standard Spec"),
    ("optical fibre cable", "IS:13882:P1", "optical fibre cables generic specification", "Electronics and IT", "Standard Spec"),
    ("cable trays", "IS:14927:P2", "cable trunking and ducting systems intended for mounting on walls or ceiling", "Electrotechnical", "Standard Spec"),
    ("cable tray", "IS:14927:P2", "cable trunking and ducting systems intended for mounting on walls or ceiling", "Electrotechnical", "Standard Spec"),
    ("perforated cable trays", "IS:14927:P2", "cable trunking and ducting systems intended for mounting on walls or ceiling", "Electrotechnical", "Standard Spec"),
    ("ladder-type cable trays", "IS:14927:P2", "cable trunking and ducting systems intended for mounting on walls or ceiling", "Electrotechnical", "Standard Spec"),
    ("ladder type cable trays", "IS:14927:P2", "cable trunking and ducting systems intended for mounting on walls or ceiling", "Electrotechnical", "Standard Spec"),
    ("gi cable conduits", "IS:9537:P2", "conduits for electrical installations rigid steel conduits", "Electrotechnical", "Standard Spec"),
    ("gi cable conduit", "IS:9537:P2", "conduits for electrical installations rigid steel conduits", "Electrotechnical", "Standard Spec"),
    ("pvc electrical conduits", "IS:9537:P3", "conduits for electrical installations rigid plain conduits of insulating materials", "Electrotechnical", "Standard Spec"),
    ("pvc electrical conduit", "IS:9537:P3", "conduits for electrical installations rigid plain conduits of insulating materials", "Electrotechnical", "Standard Spec"),
    ("flexible electrical conduits", "IS:9537:P4", "conduits for electrical installations pliable conduits of insulating materials", "Electrotechnical", "Standard Spec"),
    ("flexible electrical conduit", "IS:9537:P4", "conduits for electrical installations pliable conduits of insulating materials", "Electrotechnical", "Standard Spec"),
    ("modular switches", "IS:3854", "switches for domestic and similar purposes", "Electrotechnical", "Standard Spec"),
    ("modular switch", "IS:3854", "switches for domestic and similar purposes", "Electrotechnical", "Standard Spec"),
    ("modular electrical sockets", "IS:1293", "plugs and socket outlets for household and similar purposes", "Electrotechnical", "Standard Spec"),
    ("modular electrical socket", "IS:1293", "plugs and socket outlets for household and similar purposes", "Electrotechnical", "Standard Spec"),
    ("industrial plug and socket outlets", "IS/IEC:60309:P1", "plugs socket outlets and couplers for industrial purposes", "Electrotechnical", "Standard Spec"),
    ("industrial plug and socket", "IS/IEC:60309:P1", "plugs socket outlets and couplers for industrial purposes", "Electrotechnical", "Standard Spec"),
    ("mcb distribution board", "IS:13032", "ac miniature circuit breaker boards", "Electrotechnical", "Standard Spec"),
    ("mcb db", "IS:13032", "ac miniature circuit breaker boards", "Electrotechnical", "Standard Spec"),
    ("mccb", "IS/IEC:60947:P2", "low voltage switchgear and controlgear circuit breakers mccb", "Electrotechnical", "Standard Spec"),
    ("rccb", "IS:12640:P1", "residual current operated circuit breakers without integral overcurrent protection rccb", "Electrotechnical", "Standard Spec"),
    ("rcbo", "IS:12640:P2", "residual current operated circuit breakers with integral overcurrent protection rcbo", "Electrotechnical", "Standard Spec"),
    ("mcb", "IS/IEC:60898:P1", "circuit breakers for overcurrent protection for household mcb", "Electrotechnical", "Standard Spec"),
    ("hrc fuse", "IS:13703:P1", "lv fuses for voltages not exceeding 1000 v ac general requirements", "Electrotechnical", "Standard Spec"),
    ("switch disconnector", "IS/IEC:60947:P3", "low-voltage switchgear switches disconnectors switch disconnectors", "Electrotechnical", "Standard Spec"),
    ("automatic transfer switch", "IS/IEC:60947:P3", "low-voltage switchgear and controlgear transfer switching equipment", "Electrotechnical", "Standard Spec"),
    ("ats", "IS/IEC:60947:P3", "low-voltage switchgear and controlgear transfer switching equipment", "Electrotechnical", "Standard Spec"),
    ("main distribution board", "IS:8623:P1", "low voltage switchgear and controlgear assemblies", "Electrotechnical", "Standard Spec"),
    ("motor control centre", "IS:8623:P1", "low voltage switchgear and controlgear assemblies motor control centre", "Electrotechnical", "Standard Spec"),
    ("mcc panel", "IS:8623:P1", "low voltage switchgear and controlgear assemblies motor control centre", "Electrotechnical", "Standard Spec"),
    ("capacitor bank", "IS:13340", "power capacitors of self healing type for ac power systems", "Electrotechnical", "Standard Spec"),
    ("power factor correction panel", "IS:13340", "power capacitors of self healing type for power factor correction", "Electrotechnical", "Standard Spec"),
    ("apfc panel", "IS:13340", "automatic power factor correction panel shunt capacitors", "Electrotechnical", "Standard Spec"),
    ("busbar trunking system", "IS:8623:P2", "low voltage switchgear assemblies busbar trunking systems busway", "Electrotechnical", "Standard Spec"),
    ("busbar trunking", "IS:8623:P2", "low voltage switchgear assemblies busbar trunking systems busway", "Electrotechnical", "Standard Spec"),
    ("bbts", "IS:8623:P2", "low voltage switchgear assemblies busbar trunking systems busway", "Electrotechnical", "Standard Spec"),
    ("electrical isolator", "IS/IEC:60947:P3", "low-voltage switchgear switches disconnectors and isolators", "Electrotechnical", "Standard Spec"),
    ("lightning protection system", "IS:2309", "code of practice for the protection of buildings and allied structures against lightning", "Electrotechnical", "Standard Spec"),
    ("copper earthing electrode", "IS:3043", "code of practice for earthing - copper earthing electrode", "Electrotechnical", "Standard Spec"),
    ("gi earthing strip", "IS:3043", "code of practice for earthing - galvanized iron earthing strip", "Electrotechnical", "Standard Spec"),
    ("chemical earthing electrode", "IS:3043", "code of practice for earthing - chemical pipe earthing electrode", "Electrotechnical", "Standard Spec"),
    ("earthing electrode", "IS:3043", "code of practice for earthing", "Electrotechnical", "Standard Spec"),
    ("chemical earthing", "IS:3043", "code of practice for earthing", "Electrotechnical", "Standard Spec"),

    # Lighting & Luminaires
    ("led panel light", "IS:16107:P2:S1", "luminaires performance led luminaire", "Electrotechnical", "Standard Spec"),
    ("led downlight", "IS:10322:P5:S2", "luminaires particular requirements recessed luminaires", "Electrotechnical", "Standard Spec"),
    ("led tube light", "IS:16102:P2", "self-ballasted led lamps for general lighting services", "Electrotechnical", "Standard Spec"),
    ("led floodlight", "IS:10322:P5:S5", "luminaires particular requirements flood light", "Electrotechnical", "Standard Spec"),
    ("led high-bay luminaire", "IS:16107:P2:S1", "luminaires performance led luminaire", "Electrotechnical", "Standard Spec"),
    ("led emergency light", "IS:9583", "emergency lighting units", "Electrotechnical", "Standard Spec"),
    ("exit sign luminaire", "IS:9583", "emergency lighting units and illuminated exit signs", "Electrotechnical", "Standard Spec"),
    ("explosion-proof led luminaire", "IS/IEC:60079:P1", "explosive atmospheres equipment protection by flameproof enclosures", "Electrotechnical", "Standard Spec"),
    ("flameproof luminaire", "IS/IEC:60079:P1", "explosive atmospheres equipment protection by flameproof enclosures", "Electrotechnical", "Standard Spec"),
    ("solar street light", "IS:10322:P5:S3", "luminaires for road and street lighting", "Electrotechnical", "Standard Spec"),
    ("solar led garden light", "IS:10322:P5:S3", "luminaires for road and street lighting", "Electrotechnical", "Standard Spec"),
    ("high mast lighting system", "IS:10322:P5:S5", "luminaires particular requirements flood light", "Electrotechnical", "Standard Spec"),
    ("street lighting pole", "IS:2713:P1", "tubular steel poles for overhead power lines and street lighting", "Civil Engineering", "Standard Spec"),
    ("decorative indoor lighting fixture", "IS:10322:P5:S1", "luminaires general purpose luminaires", "Electrotechnical", "Standard Spec"),
    ("outdoor lighting fixture", "IS:10322:P5:S3", "luminaires for road and street lighting", "Electrotechnical", "Standard Spec"),

    # Power Generation, Transformers & Conditioning
    ("standby diesel generator", "IS:13364:P2", "ac generators driven by reciprocating internal combustion engine", "Electrotechnical", "Standard Spec"),
    ("diesel generator set", "IS:13364:P2", "ac generators driven by reciprocating internal combustion engine", "Electrotechnical", "Standard Spec"),
    ("dg set", "IS:13364:P2", "ac generators driven by reciprocating internal combustion engine", "Electrotechnical", "Standard Spec"),
    ("automatic mains failure panel", "IS:8623:P1", "low-voltage switchgear and controlgear assemblies amf panel", "Electrotechnical", "Standard Spec"),
    ("amf panel", "IS:8623:P1", "low-voltage switchgear and controlgear assemblies amf panel", "Electrotechnical", "Standard Spec"),
    ("generator control panel", "IS:8623:P1", "low-voltage switchgear and controlgear assemblies generator control", "Electrotechnical", "Standard Spec"),
    ("electrical distribution transformer", "IS:1180", "outdoor type oil immersed distribution transformers", "Electrotechnical", "Standard Spec"),
    ("distribution transformer", "IS:1180", "outdoor type oil immersed distribution transformers", "Electrotechnical", "Standard Spec"),
    ("dry-type transformer", "IS:11171", "dry-type power transformers", "Electrotechnical", "Standard Spec"),
    ("oil-immersed transformer", "IS:1180", "outdoor type oil immersed distribution transformers", "Electrotechnical", "Standard Spec"),
    ("voltage stabilizer", "IS:9815:P1", "servo-motor operated automatic line voltage correctors", "Electrotechnical", "Standard Spec"),
    ("servo voltage stabilizer", "IS:9815:P1", "servo-motor operated automatic line voltage correctors", "Electrotechnical", "Standard Spec"),
    ("static ups", "IS:16242:P1", "uninterruptible power systems ups general and safety requirements", "Electronics and IT", "Standard Spec"),
    ("online double-conversion ups", "IS:16242:P1", "uninterruptible power systems ups general and safety requirements", "Electronics and IT", "Standard Spec"),
    ("online ups", "IS:16242:P1", "uninterruptible power systems ups general and safety requirements", "Electronics and IT", "Standard Spec"),
    ("inverter system", "IS:16242:P1", "power inverters and uninterruptible power systems", "Electronics and IT", "Standard Spec"),

    # Batteries & Energy Storage
    ("emergency lighting battery system", "IS:15549", "stationary valve regulated lead acid batteries", "Electrotechnical", "Standard Spec"),
    ("lead-acid battery bank", "IS:13369", "stationary lead acid batteries with tubular positive plates", "Electrotechnical", "Standard Spec"),
    ("lithium-ion battery energy storage system", "IS:16046:P2", "secondary cells and batteries containing alkaline or other non-acid electrolytes lithium cells", "Electronics and IT", "Standard Spec"),
    ("bess", "IS:16046:P2", "battery energy storage systems lithium ion", "Electronics and IT", "Standard Spec"),

    # Solar PV Systems
    ("solar photovoltaic inverter", "IS/IEC:61683", "photovoltaic systems power conditioners procedure for measuring efficiency", "Electrotechnical", "Standard Spec"),
    ("solar inverter", "IS/IEC:61683", "photovoltaic systems power conditioners procedure for measuring efficiency", "Electrotechnical", "Standard Spec"),
    ("solar photovoltaic module", "IS:14286", "crystalline silicon terrestrial photovoltaic pv modules design qualification and type approval", "Electrotechnical", "Standard Spec"),
    ("solar pv module", "IS:14286", "crystalline silicon terrestrial photovoltaic pv modules design qualification and type approval", "Electrotechnical", "Standard Spec"),
    ("solar panel", "IS:14286", "crystalline silicon terrestrial photovoltaic pv modules design qualification and type approval", "Electrotechnical", "Standard Spec"),
    ("solar charge controller", "IS/IEC:61683", "photovoltaic systems power conditioners procedure for measuring efficiency", "Electrotechnical", "Standard Spec"),

    # Meters & Security / ELV Systems
    ("building energy meter", "IS:13779", "ac static watthour meters class 1 and 2", "Electrotechnical", "Standard Spec"),
    ("smart electricity meter", "IS:16444", "ac static direct connected watthour smart meter class 1 and 2", "Electrotechnical", "Standard Spec"),
    ("cctv camera system", "IS:13252:P1", "information technology equipment safety general requirements cctv", "Electronics and IT", "Standard Spec"),
    ("network video recorder", "IS:13252:P1", "information technology equipment safety general requirements nvr", "Electronics and IT", "Standard Spec"),
    ("nvr", "IS:13252:P1", "information technology equipment safety general requirements nvr", "Electronics and IT", "Standard Spec"),
    ("public address system", "IS:1881", "code of practice for indoor installation of public address systems", "Electronics and IT", "Standard Spec"),
    ("pa system", "IS:1881", "code of practice for indoor installation of public address systems", "Electronics and IT", "Standard Spec"),
    ("access control system", "IS:13252:P1", "information technology equipment safety access control systems", "Electronics and IT", "Standard Spec"),
    ("biometric attendance system", "IS:13252:P1", "information technology equipment safety biometric attendance devices", "Electronics and IT", "Standard Spec"),
    ("video intercom system", "IS:13252:P1", "information technology equipment safety video intercom systems", "Electronics and IT", "Standard Spec"),
    ("intrusion alarm system", "IS:13252:P1", "information technology equipment safety electronic intrusion alarm systems", "Electronics and IT", "Standard Spec"),

    # Plumbing, Pipes, Valves & Drainage (Batch 221-260)
    ("hdpe potable water pipes", "IS:4984", "high density polyethylene pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),
    ("hdpe potable water pipe", "IS:4984", "high density polyethylene pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),
    ("hdpe water pipes", "IS:4984", "high density polyethylene pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),
    ("hdpe pipes", "IS:4984", "high density polyethylene pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),

    ("hdpe drainage pipes", "IS:14333", "high density polyethylene pipe for sewerage and drainage", "Civil Engineering", "CPWD Spec"),
    ("hdpe drainage pipe", "IS:14333", "high density polyethylene pipe for sewerage and drainage", "Civil Engineering", "CPWD Spec"),
    ("hdpe sewerage pipes", "IS:14333", "high density polyethylene pipe for sewerage and drainage", "Civil Engineering", "CPWD Spec"),
    ("hdpe sewerage pipe", "IS:14333", "high density polyethylene pipe for sewerage and drainage", "Civil Engineering", "CPWD Spec"),

    ("ppr water supply pipes", "IS:15801", "polypropylene-random copolymer pipes for hot and cold water supplies", "Civil Engineering", "CPWD Spec"),
    ("ppr water supply pipe", "IS:15801", "polypropylene-random copolymer pipes for hot and cold water supplies", "Civil Engineering", "CPWD Spec"),
    ("ppr hot water pipes", "IS:15801", "polypropylene-random copolymer pipes for hot and cold water supplies", "Civil Engineering", "CPWD Spec"),
    ("ppr hot water pipe", "IS:15801", "polypropylene-random copolymer pipes for hot and cold water supplies", "Civil Engineering", "CPWD Spec"),
    ("ppr pipes", "IS:15801", "polypropylene-random copolymer pipes for hot and cold water supplies", "Civil Engineering", "CPWD Spec"),

    ("pvc pressure pipes", "IS:4985", "unplasticized pvc pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),
    ("pvc pressure pipe", "IS:4985", "unplasticized pvc pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),
    ("upvc pressure pipes", "IS:4985", "unplasticized pvc pipes for potable water supplies", "Civil Engineering", "CPWD Spec"),

    ("pvc drainage pipes", "IS:13592", "unplasticized polyvinyl chloride pipes for soil and waste discharge systems inside buildings", "Civil Engineering", "CPWD Spec"),
    ("pvc drainage pipe", "IS:13592", "unplasticized polyvinyl chloride pipes for soil and waste discharge systems inside buildings", "Civil Engineering", "CPWD Spec"),
    ("pvc swr pipes", "IS:13592", "unplasticized polyvinyl chloride pipes for soil waste and rainwater systems", "Civil Engineering", "CPWD Spec"),
    ("pvc swr pipe", "IS:13592", "unplasticized polyvinyl chloride pipes for soil waste and rainwater systems", "Civil Engineering", "CPWD Spec"),
    ("upvc swr pipes", "IS:13592", "unplasticized polyvinyl chloride pipes for soil waste and rainwater systems", "Civil Engineering", "CPWD Spec"),

    ("cast iron soil pipes", "IS:3989", "centrifugally cast spun iron spigot and socket soil waste ventilation and rainwater pipes", "Civil Engineering", "CPWD Spec"),
    ("cast iron soil pipe", "IS:3989", "centrifugally cast spun iron spigot and socket soil waste ventilation and rainwater pipes", "Civil Engineering", "CPWD Spec"),
    ("ci soil pipes", "IS:3989", "centrifugally cast spun iron spigot and socket soil waste ventilation and rainwater pipes", "Civil Engineering", "CPWD Spec"),

    ("ductile iron water pipes", "IS:8329", "centrifugally cast spun ductile iron pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),
    ("ductile iron water pipe", "IS:8329", "centrifugally cast spun ductile iron pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),
    ("di pipes for water supply", "IS:8329", "centrifugally cast spun ductile iron pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),
    ("di water pipes", "IS:8329", "centrifugally cast spun ductile iron pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),

    ("copper water supply pipes", "IS:1545", "solid drawn copper and copper alloy tubes for water and heat exchangers", "Civil Engineering", "CPWD Spec"),
    ("copper water supply pipe", "IS:1545", "solid drawn copper and copper alloy tubes for water and heat exchangers", "Civil Engineering", "CPWD Spec"),
    ("copper water pipes", "IS:1545", "solid drawn copper and copper alloy tubes for water and heat exchangers", "Civil Engineering", "CPWD Spec"),
    ("copper tubes for water supply", "IS:1545", "solid drawn copper and copper alloy tubes for water and heat exchangers", "Civil Engineering", "CPWD Spec"),

    ("stainless steel water pipes", "IS:17876", "stainless steel welded pipes and tubes for general service", "Civil Engineering", "CPWD Spec"),
    ("stainless steel water pipe", "IS:17876", "stainless steel welded pipes and tubes for general service", "Civil Engineering", "CPWD Spec"),
    ("ss water pipes", "IS:17876", "stainless steel welded pipes and tubes for general service", "Civil Engineering", "CPWD Spec"),

    ("brass compression fittings", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("brass compression fitting", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("brass pipe fittings", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),

    ("cpvc pipe fittings", "IS:17546", "chlorinated polyvinyl chloride cpvc fittings for potable hot and cold water distribution supplies", "Civil Engineering", "CPWD Spec"),
    ("cpvc fittings", "IS:17546", "chlorinated polyvinyl chloride cpvc fittings for potable hot and cold water distribution supplies", "Civil Engineering", "CPWD Spec"),

    ("upvc pipe fittings", "IS:7834:P1", "injection moulded pvc socket fittings with solvent cement joints for water supplies", "Civil Engineering", "CPWD Spec"),
    ("pvc pipe fittings", "IS:7834:P1", "injection moulded pvc socket fittings with solvent cement joints for water supplies", "Civil Engineering", "CPWD Spec"),

    ("hdpe pipe fittings", "IS:8360", "fabricated polyethylene fittings for water supply specification", "Civil Engineering", "CPWD Spec"),
    ("hdpe fittings", "IS:8360", "fabricated polyethylene fittings for water supply specification", "Civil Engineering", "CPWD Spec"),

    ("ppr pipe fittings", "IS:15801", "polypropylene-random copolymer pipes and fittings for water supplies", "Civil Engineering", "CPWD Spec"),
    ("ppr fittings", "IS:15801", "polypropylene-random copolymer pipes and fittings for water supplies", "Civil Engineering", "CPWD Spec"),

    ("ductile iron pipe fittings", "IS:9523", "ductile iron fittings for pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),
    ("di pipe fittings", "IS:9523", "ductile iron fittings for pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),
    ("ductile iron fittings", "IS:9523", "ductile iron fittings for pressure pipes for water gas and sewage", "Civil Engineering", "CPWD Spec"),

    ("brass bib taps", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("brass bib tap", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("bib taps", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("bib tap", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),

    ("pillar taps", "IS:1795", "pillar taps for water supply purposes", "Civil Engineering", "CPWD Spec"),
    ("pillar tap", "IS:1795", "pillar taps for water supply purposes", "Civil Engineering", "CPWD Spec"),

    ("angle valves", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("angle valve", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),
    ("brass angle valve", "IS:8931", "copper alloy single taps stop valves combination tap assembly for water services", "Civil Engineering", "CPWD Spec"),

    ("ball valves", "IS:9890", "general purpose ball valves specification", "Mechanical Engineering", "CPWD Spec"),
    ("ball valve", "IS:9890", "general purpose ball valves specification", "Mechanical Engineering", "CPWD Spec"),

    ("butterfly valves", "IS:13095", "butterfly valves for general purposes specification", "Mechanical Engineering", "CPWD Spec"),
    ("butterfly valve", "IS:13095", "butterfly valves for general purposes specification", "Mechanical Engineering", "CPWD Spec"),

    ("check valves", "IS:5312:P1", "swing check type reflux non-return valves for water works purposes", "Mechanical Engineering", "CPWD Spec"),
    ("check valve", "IS:5312:P1", "swing check type reflux non-return valves for water works purposes", "Mechanical Engineering", "CPWD Spec"),
    ("non return valve", "IS:5312:P1", "swing check type reflux non-return valves for water works purposes", "Mechanical Engineering", "CPWD Spec"),

    ("pressure reducing valves", "IS:9739", "pressure reducing valves for domestic water supply systems", "Mechanical Engineering", "CPWD Spec"),
    ("pressure reducing valve", "IS:9739", "pressure reducing valves for domestic water supply systems", "Mechanical Engineering", "CPWD Spec"),
    ("prv", "IS:9739", "pressure reducing valves for domestic water supply systems", "Mechanical Engineering", "CPWD Spec"),

    ("float valves", "IS:1703", "water fittings copper alloy float valves horizontal plunger type", "Civil Engineering", "CPWD Spec"),
    ("float valve", "IS:1703", "water fittings copper alloy float valves horizontal plunger type", "Civil Engineering", "CPWD Spec"),

    ("air release valves", "IS:14845", "resilient seated cast iron air relief valves for water works purposes", "Mechanical Engineering", "CPWD Spec"),
    ("air release valve", "IS:14845", "resilient seated cast iron air relief valves for water works purposes", "Mechanical Engineering", "CPWD Spec"),
    ("air relief valve", "IS:14845", "resilient seated cast iron air relief valves for water works purposes", "Mechanical Engineering", "CPWD Spec"),

    ("water meters", "IS:779", "water meters domestic type specification", "Civil Engineering", "CPWD Spec"),
    ("water meter", "IS:779", "water meters domestic type specification", "Civil Engineering", "CPWD Spec"),

    ("domestic water storage tanks", "IS:12701", "rotational moulded polyethylene water storage tanks", "Civil Engineering", "CPWD Spec"),
    ("domestic water storage tank", "IS:12701", "rotational moulded polyethylene water storage tanks", "Civil Engineering", "CPWD Spec"),
    ("polyethylene water storage tanks", "IS:12701", "rotational moulded polyethylene water storage tanks", "Civil Engineering", "CPWD Spec"),
    ("polyethylene water storage tank", "IS:12701", "rotational moulded polyethylene water storage tanks", "Civil Engineering", "CPWD Spec"),
    ("overhead water storage tank", "IS:12701", "rotational moulded polyethylene water storage tanks", "Civil Engineering", "CPWD Spec"),
    ("sintex tank", "IS:12701", "rotational moulded polyethylene water storage tanks", "Civil Engineering", "Trade Name"),

    ("reinforced concrete water tanks", "IS:3370:P1", "code of practice concrete structures for the storage of liquids", "Civil Engineering", "CPWD Spec"),
    ("reinforced concrete water tank", "IS:3370:P1", "code of practice concrete structures for the storage of liquids", "Civil Engineering", "CPWD Spec"),
    ("rcc water tank", "IS:3370:P1", "code of practice concrete structures for the storage of liquids", "Civil Engineering", "CPWD Spec"),

    ("septic tank", "IS:2470:P1", "code of practice for installation of septic tanks design criteria and construction", "Civil Engineering", "CPWD Spec"),
    ("septic tanks", "IS:2470:P1", "code of practice for installation of septic tanks design criteria and construction", "Civil Engineering", "CPWD Spec"),

    ("sewage treatment plant", "IS:2470:P2", "code of practice for installation of septic tanks secondary treatment and disposal of effluent", "Civil Engineering", "CPWD Spec"),
    ("stp", "IS:2470:P2", "code of practice for installation of septic tanks secondary treatment and disposal of effluent", "Civil Engineering", "CPWD Spec"),

    ("grease trap", "IS:1742", "code of practice for building drainage grease trap and gully trap", "Civil Engineering", "CPWD Spec"),
    ("grease traps", "IS:1742", "code of practice for building drainage grease trap and gully trap", "Civil Engineering", "CPWD Spec"),

    ("floor traps", "IS:3989", "centrifugally cast spun iron floor traps and rainwater fittings", "Civil Engineering", "CPWD Spec"),
    ("floor trap", "IS:3989", "centrifugally cast spun iron floor traps and rainwater fittings", "Civil Engineering", "CPWD Spec"),

    ("nahani traps", "IS:3989", "centrifugally cast spun iron nahani traps and floor traps", "Civil Engineering", "CPWD Spec"),
    ("nahani trap", "IS:3989", "centrifugally cast spun iron nahani traps and floor traps", "Civil Engineering", "CPWD Spec"),

    ("gully traps", "IS:651", "glazed stoneware pipes and gully traps for drainage", "Civil Engineering", "CPWD Spec"),
    ("gully trap", "IS:651", "glazed stoneware pipes and gully traps for drainage", "Civil Engineering", "CPWD Spec"),

    ("manhole covers", "IS:1726", "cast iron manhole covers and frames", "Civil Engineering", "CPWD Spec"),
    ("manhole cover", "IS:1726", "cast iron manhole covers and frames", "Civil Engineering", "CPWD Spec"),
    ("ci manhole covers", "IS:1726", "cast iron manhole covers and frames", "Civil Engineering", "CPWD Spec"),

    ("cast iron drainage gratings", "IS:5961", "cast iron gratings for drainage purposes", "Civil Engineering", "CPWD Spec"),
    ("cast iron drainage grating", "IS:5961", "cast iron gratings for drainage purposes", "Civil Engineering", "CPWD Spec"),
    ("drainage gratings", "IS:5961", "cast iron gratings for drainage purposes", "Civil Engineering", "CPWD Spec"),

    ("sanitary drainage inspection chambers", "IS:4111:P1", "code of practice for ancillary structures in sewerage system manholes inspection chambers", "Civil Engineering", "CPWD Spec"),
    ("inspection chambers", "IS:4111:P1", "code of practice for ancillary structures in sewerage system manholes inspection chambers", "Civil Engineering", "CPWD Spec"),
    ("inspection chamber", "IS:4111:P1", "code of practice for ancillary structures in sewerage system manholes inspection chambers", "Civil Engineering", "CPWD Spec")
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
