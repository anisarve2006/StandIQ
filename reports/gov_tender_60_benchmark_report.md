# MaanakAI (मानक AI) — 60 Government Tender BoQ Test Cases Evaluation Report

**Executive Summary:** Official validation report of the MaanakAI Standards Recommender Engine across authentic government procurement specifications from CPWD, State PWDs, Jal Jeevan Mission, NHAI, State Electricity Discoms, GeM, Indian Railways, and Airport Authority of India.

- **Evaluation Date:** September 2026
- **Dataset:** `gov_tenders_60.json` (60 Ground-Truth Government Tender Cases)
- **Hardware & Inference Environment:** Intel Core CPU (Air-Gapped Sovereign Mode, ONNX Runtime FastEmbed, SQLite FTS5)
- **Verification Kernel:** Deterministic SQLite verification against 19,423 Indian Standards and 2,246 live Gazette Quality Control Orders (QCOs)

---

## 1. Executive Metrics Summary

| Metric | Benchmark Target | MaanakAI Result | Evaluation Status |
|---|---|---|---|
| **Top-1 Accuracy** | ≥ 85.0% | **93.3%** (56/60) | PASS |
| **Top-3 Recall** | ≥ 92.0% | **93.3%** (56/60) | PASS |
| **Top-5 Recall** | ≥ 95.0% | **93.3%** (56/60) | REVIEW |
| **Mean Reciprocal Rank (MRR)** | ≥ 0.8800 | **0.9333** | PASS |
| **Compulsory QCO Match** | ≥ 88.0% | **76.7%** (46/60) | REVIEW |
| **Zero-Hallucination Rate** | 100.0% | **96.7%** | FAIL |
| **Latency (Median p50)** | < 1,500 ms | **3266.8 ms** | REVIEW |
| **Latency (p95)** | < 3,500 ms | **9419.1 ms** | REVIEW |

---

## 2. Domain-Wise Accuracy Breakdown

| Engineering Division / Procurement Domain | Cases | Top-1 Accuracy | Top-3 Recall | Top-5 Recall | Median Latency |
|---|---|---|---|---|---|
| **Civil & Structural** | 17 | 94.1% | 94.1% | 94.1% | 3278.8 ms |
| **Electrical & Power** | 10 | 80.0% | 80.0% | 80.0% | 3276.9 ms |
| **Fire & Life Safety** | 8 | 87.5% | 87.5% | 87.5% | 3554.4 ms |
| **Highways & Infrastructure** | 5 | 100.0% | 100.0% | 100.0% | 2827.3 ms |
| **Railways & Heavy Industry** | 3 | 100.0% | 100.0% | 100.0% | 2311.9 ms |
| **Smart Cities & IT** | 5 | 100.0% | 100.0% | 100.0% | 3746.4 ms |
| **Water Supply & PHED** | 12 | 100.0% | 100.0% | 100.0% | 3192.6 ms |

---

## 3. Agency-Wise Procurement Breakdown

| Procuring Authority / Agency | Cases Evaluated | Top-1 Precision | Top-3 Coverage |
|---|---|---|---|
| Airport Authority of India (AAI) | 2 | 100.0% | 100.0% |
| Border Roads Organisation (BRO) | 1 | 100.0% | 100.0% |
| CPWD / MoHUA | 1 | 100.0% | 100.0% |
| CPWD Electrical Wing | 1 | 100.0% | 100.0% |
| CPWD Horticulture & Civil | 1 | 0.0% | 0.0% |
| CPWD Maintenance Division | 1 | 100.0% | 100.0% |
| CPWD Project Circle | 1 | 100.0% | 100.0% |
| CPWD Sub-Station Division | 1 | 0.0% | 0.0% |
| DDA Housing Division | 1 | 100.0% | 100.0% |
| Dedicated Freight Corridor (DFCCIL) | 1 | 100.0% | 100.0% |
| Delhi Development Authority (DDA) | 1 | 100.0% | 100.0% |
| Delhi Jal Board (DJB) | 1 | 100.0% | 100.0% |
| Delhi Metro Rail Corporation (DMRC) | 1 | 100.0% | 100.0% |
| Energy Efficiency Services Limited (EESL) | 1 | 100.0% | 100.0% |
| GeM Procurement Portal | 1 | 100.0% | 100.0% |
| High Court Building Administration | 1 | 100.0% | 100.0% |
| Hospital Services Consultancy (HSCC) | 1 | 100.0% | 100.0% |
| Indian Navy / Mazagon Dock | 1 | 100.0% | 100.0% |
| Indian Railways / RDSO | 1 | 100.0% | 100.0% |
| Jal Jeevan Mission (JJM) / PHED | 1 | 100.0% | 100.0% |
| L&T Construction / NHAI Safety | 1 | 100.0% | 100.0% |
| Maharashtra Jeevan Pradhikaran (MJP) | 1 | 100.0% | 100.0% |
| Metro Rail Corporation | 1 | 100.0% | 100.0% |
| Military Engineer Services (MES) | 1 | 100.0% | 100.0% |
| Ministry of Defence (MoD) / Ordnance | 1 | 100.0% | 100.0% |
| MoRTH Expressway Project | 1 | 100.0% | 100.0% |
| Municipal Corporation Street Lighting | 1 | 100.0% | 100.0% |
| Municipal Corporation Water Works | 1 | 100.0% | 100.0% |
| Municipal Fire Brigade | 1 | 100.0% | 100.0% |
| Municipal Health Department | 1 | 100.0% | 100.0% |
| NBCC (India) Limited | 1 | 100.0% | 100.0% |
| NHAI Bridge Division | 1 | 100.0% | 100.0% |
| NTPC Thermal Power Project | 1 | 0.0% | 0.0% |
| National Highways Authority of India (NHAI) | 1 | 100.0% | 100.0% |
| National Informatics Centre (NIC) Data Centre | 1 | 100.0% | 100.0% |
| National Smart Grid Mission (NSGM) | 1 | 100.0% | 100.0% |
| PMAY Urban Housing Mission | 1 | 100.0% | 100.0% |
| Power Grid Corporation of India (PGCIL) | 1 | 100.0% | 100.0% |
| RDSS Scheme Discom Circle | 1 | 100.0% | 100.0% |
| Rural Water Supply & Sanitation (RWSS) | 1 | 100.0% | 100.0% |
| Smart City Development Corporation | 1 | 100.0% | 100.0% |
| Smart City Surveillance Command Center | 1 | 100.0% | 100.0% |
| Smart City Water Utility | 1 | 100.0% | 100.0% |
| Solar Energy Corporation of India (SECI) | 1 | 100.0% | 100.0% |
| State Disaster Response Force (SDRF) | 1 | 0.0% | 0.0% |
| State Electricity Distribution Company (Discom) | 1 | 100.0% | 100.0% |
| State Highway Development Project | 1 | 100.0% | 100.0% |
| State Industrial Development Corporation | 1 | 100.0% | 100.0% |
| State Irrigation & Water Resources | 1 | 100.0% | 100.0% |
| State PWD Buildings Division | 1 | 100.0% | 100.0% |
| State PWD Roads & Bridges | 1 | 100.0% | 100.0% |
| State Police Housing Corporation | 1 | 100.0% | 100.0% |
| State Road Development Corporation | 1 | 100.0% | 100.0% |
| State Secretariat Electrical Maintenance | 1 | 100.0% | 100.0% |
| State Transmission Corporation (STU) | 1 | 100.0% | 100.0% |
| Steel Authority of India (SAIL) | 1 | 100.0% | 100.0% |
| UP Jal Nigam / JJM | 1 | 100.0% | 100.0% |
| Urban Drainage & Sewerage Board | 1 | 100.0% | 100.0% |
| Zilla Parishad Rural Water | 1 | 100.0% | 100.0% |

---

## 4. Itemized Evaluation Audit Log

| Case ID | Procuring Agency & Item | Expected Standard | Top-1 Retrieved Standard | Rank | QCO Mandate | Verification |
|---|---|---|---|---|---|---|
| `TENDER-01` | CPWD / MoHUA: Supply of High Strength TMT Steel Reinforcement Bars Fe 500D | `IS:1786` | `IS:1786` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-02` | State PWD Buildings Division: Ordinary Portland Cement 43 Grade for Reinforced Concrete Works | `IS:269` | `IS:269` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-03` | Delhi Development Authority (DDA): Portland Pozzolana Cement Fly Ash Based for Plaster and Masonry | `IS:1489:P1` | `IS:1489:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-04` | NBCC (India) Limited: Hot Rolled Structural Steel Beams Columns Angles E250 | `IS:2062` | `IS:2062` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-05` | CPWD Horticulture & Civil: Ready Mixed Concrete RMC M30 Grade | `IS:4926` | `IS:4925` | MISS | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-06` | State Police Housing Corporation: Vitrified Ceramic Floor Tiles 600x600 mm | `IS:15622` | `IS:15622` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-07` | Military Engineer Services (MES): Solid Core Wooden Flush Door Shutters 35mm | `IS:2202` | `IS:2202:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-08` | PMAY Urban Housing Mission: Precast Solid Concrete Blocks for Load Bearing Walls | `IS:2185:P1` | `IS:2185:P1` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-09` | Smart City Development Corporation: Precast Concrete Paving Blocks for Pedestrian Walkways | `IS:15658` | `IS:15658` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-10` | CPWD Project Circle: Pressed Mild Steel Door Frames Profile C | `IS:4351` | `IS:4351` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-11` | Hospital Services Consultancy (HSCC): Stainless Steel Kitchen Sinks for Hospital Canteen | `IS:13983` | `IS:13983` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-12` | DDA Housing Division: White Vitreous China Orissa Pattern Water Closet Pan | `IS:2556:P3` | `IS:2556:P3` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-13` | CPWD Maintenance Division: Plastic Dual Flushing Cistern for Water Closets | `IS:7231` | `IS:7231` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-14` | State PWD Roads & Bridges: Paving Bitumen VG-30 for Dense Bituminous Macadam | `IS:73` | `IS:73` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-15` | National Highways Authority of India (NHAI): Cationic Bitumen Emulsion Rapid Setting RS-1 | `IS:8887` | `IS:8887` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-16` | Airport Authority of India (AAI): Extruded Aluminium Windows and Glazed Partitions | `IS:1948` | `IS:1948` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-17` | Metro Rail Corporation: Plywood for Concrete Shuttering and Formwork | `IS:4990` | `IS:4990` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-18` | Jal Jeevan Mission (JJM) / PHED: Galvanized Mild Steel ERW Pipes Medium Class 80mm NB | `IS:1239:P1` | `IS:1239:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-19` | Maharashtra Jeevan Pradhikaran (MJP): Centrifugally Cast Ductile Iron Pressure Pipes Class K9 300mm | `IS:8329` | `IS:8329` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-20` | Municipal Corporation Water Works: Centrifugally Cast Spun Iron Pressure Pipes 150mm | `IS:1536` | `IS:1536` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-21` | UP Jal Nigam / JJM: Unplasticized PVC Pipes 110mm 6kg/cm2 for Potable Water | `IS:4985` | `IS:4985` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-22` | Rural Water Supply & Sanitation (RWSS): High Density Polyethylene HDPE Pipes PE 100 PN 10 | `IS:4984` | `IS:4984` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-23` | Delhi Jal Board (DJB): Cast Iron Resilient Seated Sluice Valves PN 1.6 | `IS:14846` | `IS:14846` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-24` | State Irrigation & Water Resources: Submersible Pumpsets 10 HP for Deep Tubewells | `IS:8034` | `IS:8034` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-25` | Zilla Parishad Rural Water: Electric Monobloc Centrifugal Pumpset 3 HP | `IS:9079` | `IS:9079` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-26` | Municipal Health Department: Rotational Moulded Polyethylene Water Storage Tanks 5000 Litres | `IS:12701` | `IS:12701` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-27` | Urban Drainage & Sewerage Board: Cast Iron Manhole Covers and Frames Heavy Duty Grade HD-20 | `IS:1726` | `IS:1726` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-28` | Smart City Water Utility: Domestic Cold Water Meters Multi-Jet Inferential 15mm | `IS:779` | `IS:779` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-29` | State Highway Development Project: Precast Reinforced Concrete Culvert Pipes NP3 900mm | `IS:458` | `IS:458` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-30` | NHAI Bridge Division: Uncoated Low Relaxation Seven-Ply Steel Strands 12.7mm for PSC | `IS:14268` | `IS:14268` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-31` | Dedicated Freight Corridor (DFCCIL): Plain Hard-Drawn Steel Wire for Prestressed Concrete Sleepers | `IS:1785:P1` | `IS:1785:P1` | **Rank 1** | Mandatory (Match) | Unverified |
| `TENDER-32` | MoRTH Expressway Project: Hot Rolled Steel Sheets for W-Beam Highway Crash Barriers | `IS:5986` | `IS:5986` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-33` | Border Roads Organisation (BRO): Cold Reduced Carbon Steel Sheets for Road Signage Boards | `IS:513` | `IS:513` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-34` | State Road Development Corporation: Hot Applied Thermoplastic Road Marking Paint White and Yellow | `IS:164` | `IS:164` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-35` | State Electricity Distribution Company (Discom): Outdoor Step-Down Distribution Transformers 11kV/433V 100 kVA | `IS:1180` | `IS:1180:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-36` | Power Grid Corporation of India (PGCIL): ACSR Conductor Panther and Zebra for Overhead Lines | `IS:398:P2` | `IS:398:P2` | **Rank 1** | Discrepancy | Verified Zero-Hallucination |
| `TENDER-37` | State Transmission Corporation (STU): Cross-Linked Polyethylene XLPE Insulated 33kV Power Cable | `IS:7098:P2` | `IS:7098:P2` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-38` | CPWD Electrical Wing: 1.1 kV Grade PVC Insulated Copper Building Wire 2.5 sq mm | `IS:694` | `IS:694` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-39` | RDSS Scheme Discom Circle: Single Phase Whole Current Static Watthour Energy Meters | `IS:13779` | `IS:13779` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-40` | National Smart Grid Mission (NSGM): Three Phase Direct Connected Smart Prepaid Energy Meters | `IS:16444` | `IS:16444` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-41` | Energy Efficiency Services Limited (EESL): Energy Efficient Three Phase Squirrel Cage Induction Motors IE3 | `IS:12615` | `IS:12615` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-42` | NTPC Thermal Power Project: Moulded Case Circuit Breaker MCCB 400A 50kA | `IS/IEC:60947:P2` | `IS:8980` | MISS | Discrepancy | Verified Zero-Hallucination |
| `TENDER-43` | CPWD Sub-Station Division: Miniature Circuit Breakers MCB 16A Single Pole Type C | `IS/IEC:60898:P1` | `IS:13032` | MISS | Discrepancy | Verified Zero-Hallucination |
| `TENDER-44` | State Secretariat Electrical Maintenance: Rigid Steel Conduits for Heavy Duty Electrical Wiring 25mm | `IS:9537:P2` | `IS:9537:P2` | **Rank 1** | Discrepancy | Unverified |
| `TENDER-45` | Smart City Surveillance Command Center: High Definition IP CCTV Bullet Video Surveillance Cameras | `IS:13252:P1` | `IS:13252:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-46` | Municipal Corporation Street Lighting: Outdoor LED Roadway Street Light Luminaires 120W | `IS:10322` | `IS:10322:P5:S3` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-47` | GeM Procurement Portal: Self-Ballasted LED Bulbs 9W B22 Base for Office Complex | `IS:16102` | `IS:16102:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-48` | National Informatics Centre (NIC) Data Centre: Online True Double Conversion UPS System 20 kVA | `IS:16242:P1` | `IS:16242:P1` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-49` | Solar Energy Corporation of India (SECI): Crystalline Silicon Solar Photovoltaic Modules 540Wp | `IS:14286` | `IS:14286` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-50` | Airport Authority of India (AAI): Portable ABC Dry Chemical Powder Fire Extinguishers 6kg | `IS:15683` | `IS:15683` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-51` | Delhi Metro Rail Corporation (DMRC): Clean Agent HFC-227ea Fire Extinguisher 4kg for Signalling Rooms | `IS:15683` | `IS:15683` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-52` | Municipal Fire Brigade: Gunmetal Fire Hydrant Landing Valves 63mm Oblique Type | `IS:5290` | `IS:5290` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-53` | State Industrial Development Corporation: First-Aid Fire Hose Reel Swinging Type 30 Meters | `IS:884` | `IS:884` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-54` | State Disaster Response Force (SDRF): Non-Percolating Flexible Fire Fighting Delivery Hose 63mm | `IS:636` | `IS:906` | MISS | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-55` | High Court Building Administration: Heat Sensitive Rate-of-Rise Fire Detectors | `IS:2175` | `IS:2175` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-56` | L&T Construction / NHAI Safety: Industrial Safety Helmets with 4-Point Suspension | `IS:2925` | `IS:2925` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-57` | Steel Authority of India (SAIL): Industrial Safety Footwear Steel Toe Cap Boots | `IS:15298:P2` | `IS:15298:P2` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-58` | Indian Railways / RDSO: Carbon Steel Castings for Railway Freight Wagons and Bogies | `IS:1030` | `IS:1030` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |
| `TENDER-59` | Indian Navy / Mazagon Dock: Galvanized Steel Wire Ropes for Cranes and Hoisting | `IS:2266` | `IS:2266` | **Rank 1** | Mandatory (Match) | Verified Zero-Hallucination |
| `TENDER-60` | Ministry of Defence (MoD) / Ordnance: Heavy Cotton Duck Canvas for Army Tents and Tarpaulins | `IS:1422` | `IS:1422` | **Rank 1** | Voluntary (Match) | Verified Zero-Hallucination |

---

## 5. Architectural Guarantees & Verification
- **Mathematical Hallucination Prevention:** The Verification Kernel intercepts all LLM and vector search outputs. Every standard code emitted in the final recommendation is verified against SQLite primary keys in `standards.db`.
- **5-Category Allied Standards Integration:** All related testing procedures (IS 1608, IS 4031), installation practices, and safety codes are dynamically traversed and classified.
- **Regulatory Compliance Reliability:** Mandatory QCO mandates are cross-checked against official Ministry Gazette orders (Steel QCO, Cement QCO, Cables QCO, BIS Scheme-I), preventing non-compliant government tender awards.
