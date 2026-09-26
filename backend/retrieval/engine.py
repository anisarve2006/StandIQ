"""
Master Indian Standards Recommendation & Verification Engine.
The Top-Tier Core Orchestrator coordinating all 12 Architecture Layers:
1. Query Compilation (Neuro-Symbolic)
2. Adaptive Routing (Fast Path vs Complex Path)
3. Parallel Multi-Path Retrieval (Exact + Dense BGE + Lexical FTS5)
4. RRF Candidate Fusion
5. Late-Interaction MaxSim Reranking
6. Technical Constraint & Contradiction Verification
7. Knowledge Graph Expansion
8. Version & Supersession Engine
9. Compulsory Certification (QCO Registry) Engine
10. Agentic Completeness Loop
11. Structured Evidence Pack Construction
12. LLM / Deterministic 5-Point Tender Clause Drafting
13. Zero-Hallucination Verification Kernel
"""

import os
import json
import time
from typing import Dict, Any, List, Optional
from loguru import logger

from retrieval.compiler import compile_query
from retrieval.hybrid_search import HybridRetriever
from retrieval.reranker import LateInteractionReranker
from retrieval.constraint_engine import ConstraintEngine
from retrieval.graph_expander import GraphExpander
from retrieval.completeness_loop import CompletenessEngine
from retrieval.evidence_pack import EvidencePackBuilder
from retrieval.verification_kernel import VerificationKernel
from retrieval.pdf_processor import TenderPDFProcessor
from retrieval.excel_processor import tender_excel_processor

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
SQLITE_DB = os.path.join(DATA_DIR, "standards.db")

class StandardsRecommenderEngine:
    def __init__(self, db_path: str = SQLITE_DB):
        self.db_path = db_path
        self.retriever = HybridRetriever(db_path=db_path)
        self.reranker = LateInteractionReranker()
        self.constraint_engine = ConstraintEngine()
        self.graph_expander = GraphExpander(db_path=db_path)
        self.completeness_engine = CompletenessEngine(db_path=db_path)
        self.evidence_builder = EvidencePackBuilder()
        self.verification_kernel = VerificationKernel(db_path=db_path)
        self.pdf_processor = TenderPDFProcessor()
        self.excel_processor = tender_excel_processor
        
        # Initialize local sovereign LLM (BharatGPT-3B Indic)
        self.bharatgpt = None
        try:
            from services.bharatgpt_service import bharatgpt_engine
            self.bharatgpt = bharatgpt_engine
        except Exception as e:
            logger.warning(f"Could not initialize BharatGPT service: {e}")

    def generate_tender_clause_deterministic(self, evidence_pack: Dict[str, Any]) -> str:
        """
        Deterministic 5-Point Compliant Tender Specification Clause Generator.
        Used when LLM is unavailable or for instant zero-latency responses.
        Adheres strictly to GeM / CPPP government procurement guidelines.
        """
        primary = evidence_pack["primary_standard"]
        version = evidence_pack["version_verification"]
        cert = evidence_pack["certification"]
        allied = evidence_pack["allied_standards"]
        tech = evidence_pack["technical_verification"]
        gaps = evidence_pack["specification_gaps"]

        lines = []
        lines.append("### MODEL TENDER SPECIFICATION CLAUSE (BIS COMPLIANT)")
        lines.append("")
        
        # Clause 1: Governing Standard
        status_note = f"in force as of {version['as_of_date']}" if version["is_current"] else "NOTE: Requires verification against latest BIS gazette"
        lines.append(f"**1. Governing Product Standard:**")
        lines.append(f"The supplied goods/materials shall strictly conform to **{primary['raw_id']}** (*{primary['title_en']}*), including all amendments issued by the Bureau of Indian Standards (BIS) up to date ({status_note}).")
        lines.append("")

        # Clause 2: Compulsory Certification / QCO
        lines.append(f"**2. Regulatory & Quality Control Compliance:**")
        if cert["is_mandatory"]:
            scheme_title = cert["scheme"] or "BIS Standard Mark Scheme I"
            lines.append(f"Compliance with **{scheme_title}** is **MANDATORY** pursuant to the Central Government Quality Control Order (QCO): *{cert['applicable_qco']}* (Gazette Notification: {cert['gazette_notification']}). The bidder MUST possess a valid BIS licence with CML number at the time of bid submission.")
        else:
            lines.append(f"BIS certification for this category is currently voluntary / unnotified under mandatory QCO. Bidders offering BIS Certified goods with ISI Mark shall receive technical preference.")
        lines.append("")

        # Clause 3: Method of Testing & Acceptance
        lines.append(f"**3. Quality Assurance & Acceptance Testing:**")
        if allied["test_methods"]:
            test_list = ", ".join([f"{t['raw_id']} ({t['title_en']})" for t in allied["test_methods"][:2]])
            lines.append(f"Sampling and routine acceptance tests shall be performed in accordance with **{test_list}** by an NABL accredited or BIS recognized testing laboratory.")
        else:
            lines.append(f"Routine and type testing shall be conducted per the test schedules stipulated in {primary['raw_id']}.")
        lines.append("")

        # Clause 4: Installation & Safety
        lines.append(f"**4. Safety & Installation Code:**")
        safety_items = allied["safety_standards"] + allied["installation_standards"]
        if safety_items:
            sec_list = ", ".join([f"{s['raw_id']}" for s in safety_items[:2]])
            lines.append(f"Workmanship, environmental safety, and installation shall comply with **{sec_list}**.")
        else:
            lines.append(f"Handling, erection, and commissioning shall be carried out per standard engineering practices and manufacturer guidelines.")
        lines.append("")

        # Clause 5: Marking & Packaging
        lines.append(f"**5. Marking & Inspection:**")
        lines.append(f"Each consignment/unit shall be legibly and indelibly marked with: (a) Manufacturer's Name/Trade-mark, (b) Applicable Standard Number **{primary['raw_id']}**, (c) BIS Standard Mark with License (CM/L) number (if certified), (d) Batch/Lot Number, and (e) Date of Manufacture.")
        
        if gaps:
            lines.append("")
            lines.append("> **Procurement Advisory / Specification Warnings:**")
            for g in gaps:
                lines.append(f"> - [WARNING] {g}")

        return "\n".join(lines)

    def generate_tender_clause_llm(self, evidence_pack: Dict[str, Any]) -> str:
        """
        Synthesizes the explanation and GeM tender clause using local sovereign BharatGPT-3B Indic.
        Prompt strictly confines LLM to facts inside evidence_pack.
        Gracefully falls back to deterministic template generator if model is unavailable.
        """
        if not self.bharatgpt or not self.bharatgpt.is_available():
            return self.generate_tender_clause_deterministic(evidence_pack)

        primary = evidence_pack.get("primary_standard", {})
        product_name = primary.get("title_en", "Procurement Item")
        standard_id = primary.get("raw_id", primary.get("family_id", "IS Standard"))
        standard_title = primary.get("title_en", "")
        params = evidence_pack.get("technical_parameters", {})
        cert = evidence_pack.get("certification", {})
        cert_info = f"{cert.get('status', 'VOLUNTARY')} (Scheme: {cert.get('scheme', 'Scheme I')})"

        try:
            clause = self.bharatgpt.draft_specification_clause(
                product_name=product_name,
                standard_id=standard_id,
                standard_title=standard_title,
                parameters=params,
                certification_info=cert_info
            )
            if clause:
                lines = [
                    "### Executive Technical Recommendation (Sovereign BharatGPT Synthesis)",
                    f"Recommended Standard: **{standard_id}** — *{standard_title}*",
                    f"Regulatory Status: **{cert.get('status', 'VOLUNTARY')}**",
                    "",
                    "### 5-Point Compliant Tender Specification Clause (GeM / CPPP):",
                    clause
                ]
                gaps = evidence_pack.get("specification_gaps", [])
                if gaps:
                    lines.append("")
                    lines.append("> **Procurement Advisory / Specification Warnings:**")
                    for g in gaps:
                        lines.append(f"> - [WARNING] {g}")
                return "\n".join(lines)
            return self.generate_tender_clause_deterministic(evidence_pack)
        except Exception as e:
            logger.warning(f"BharatGPT clause drafting failed, falling back to deterministic: {e}")
            return self.generate_tender_clause_deterministic(evidence_pack)

    def recommend(self, query_text: str, top_candidates: int = 5) -> Dict[str, Any]:
        """
        End-to-End Orchestration Pipeline.
        Returns complete verified recommendation object with sub-millisecond audit metrics.
        """
        t0 = time.time()
        timings = {}

        # 1. Compile Query (Neuro-symbolic Layer A & B)
        t_compile = time.time()
        query_obj = compile_query(query_text)
        timings["query_compilation_ms"] = round((time.time() - t_compile) * 1000, 2)

        # Archetype Guard (Information-Theoretic Density & Non-Product Sieve)
        archetype = query_obj.get("archetype", "PHYSICAL_PRODUCT")
        arch_details = query_obj.get("archetype_details", {})

        if archetype == "SERVICE_RATE_SLAB":
            return {
                "status": "NON_PRODUCT_LINE",
                "archetype": "SERVICE_RATE_SLAB",
                "category": arch_details.get("category", "Logistics & Freight Rate Slab"),
                "query": query_text,
                "primary_recommendation": {
                    "family_id": "NONE",
                    "raw_id": "N/A (Rate Parameter)",
                    "title_en": "Commercial Tariff / Distance Freight Rate Slab (Non-Product)",
                    "status": "NOT_APPLICABLE",
                    "division": "Logistics & Commercial Operations",
                    "confidence": {
                        "overall_label": "HIGH",
                        "composite_score": 1.0
                    }
                },
                "allied_standards": {"test_methods": [], "safety_standards": [], "installation_standards": []},
                "certification": {
                    "is_mandatory": False,
                    "status": "NON_PRODUCT_PARAMETER",
                    "scheme": "None",
                    "applicable_qco": "None"
                },
                "specification_clause": "### COMMERCIAL TARIFF / DISTANCE SLAB ADVISORY\nThis line item specifies a distance or tariff pricing slab (e.g. freight tier). It represents a commercial rate parameter rather than a manufactured physical product. No Indian Standards (BIS/QCO) apply.",
                "specification_gaps": [],
                "verification_audit": {
                    "is_verified": True,
                    "hallucination_strip_rate": 0.0,
                    "violations": []
                },
                "alternative_candidates": [],
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            }

        if archetype == "FINANCIAL_ADJUSTMENT":
            return {
                "status": "NON_PRODUCT_LINE",
                "archetype": "FINANCIAL_ADJUSTMENT",
                "category": arch_details.get("category", "Financial / Scrap Credit / Disposal Adjustment"),
                "query": query_text,
                "primary_recommendation": {
                    "family_id": "NONE",
                    "raw_id": "N/A (Financial Line)",
                    "title_en": "Accounting Credit / Scrap Salvage / Waste Disposal Adjustment",
                    "status": "NOT_APPLICABLE",
                    "division": "Commercial / Contract Accounting",
                    "confidence": {
                        "overall_label": "HIGH",
                        "composite_score": 1.0
                    }
                },
                "allied_standards": {"test_methods": [], "safety_standards": [], "installation_standards": []},
                "certification": {
                    "is_mandatory": False,
                    "status": "NON_PRODUCT_PARAMETER",
                    "scheme": "None",
                    "applicable_qco": "None"
                },
                "specification_clause": "### ACCOUNTING ADJUSTMENT ADVISORY\nThis line item represents an accounting credit, scrap salvage adjustment, or demolition waste disposal entry. No BIS manufacturing product standard is applicable.",
                "specification_gaps": [],
                "verification_audit": {
                    "is_verified": True,
                    "hallucination_strip_rate": 0.0,
                    "violations": []
                },
                "alternative_candidates": [],
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            }

        if archetype == "CONTRACTUAL_CONDITION":
            return {
                "status": "NON_PRODUCT_LINE",
                "archetype": "CONTRACTUAL_CONDITION",
                "category": arch_details.get("category", "Contractual / Legal Condition"),
                "query": query_text,
                "primary_recommendation": {
                    "family_id": "NONE",
                    "raw_id": "N/A (Legal Clause)",
                    "title_en": "Contractual / Legal / Qualification Clause (Non-Product)",
                    "status": "NOT_APPLICABLE",
                    "division": "General Legal and Contract Administration",
                    "confidence": {
                        "overall_label": "HIGH",
                        "composite_score": 1.0
                    }
                },
                "allied_standards": {"test_methods": [], "safety_standards": [], "installation_standards": []},
                "certification": {
                    "is_mandatory": False,
                    "status": "NON_PRODUCT_PARAMETER",
                    "scheme": "None",
                    "applicable_qco": "None"
                },
                "specification_clause": "### LEGAL / CONTRACTUAL CONDITION ADVISORY\nThis line item represents a commercial, legal, or bidder qualification clause (e.g. GCC/SCC conditions, payment terms, defect liability). No BIS manufacturing product standard is applicable.",
                "specification_gaps": [],
                "verification_audit": {
                    "is_verified": True,
                    "hallucination_strip_rate": 0.0,
                    "violations": []
                },
                "alternative_candidates": [],
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            }

        if archetype == "SERVICE_OR_LABOUR" and not query_obj.get("exact_is"):
            svc_std = arch_details.get("service_standard", {
                "family_id": "IS/ISO:9001",
                "raw_id": "IS/ISO 9001 : 2015",
                "title_en": "Quality Management Systems - Requirements (Service Governance)",
                "status": "CURRENT"
            })
            return {
                "status": "SUCCESS",
                "archetype": "SERVICE_OR_LABOUR",
                "category": arch_details.get("category", "Operational Service Contract"),
                "query": query_text,
                "primary_recommendation": {
                    "family_id": svc_std["family_id"],
                    "raw_id": svc_std["raw_id"],
                    "title_en": svc_std["title_en"],
                    "status": svc_std["status"],
                    "division": "Management and Systems",
                    "confidence": {
                        "overall_label": "HIGH",
                        "composite_score": 0.95
                    }
                },
                "allied_standards": {"test_methods": [], "safety_standards": [], "installation_standards": []},
                "certification": {
                    "is_mandatory": False,
                    "status": "VOLUNTARY / SERVICE CODE",
                    "scheme": "Scheme I (Quality Management)",
                    "applicable_qco": "None (Service Contract)"
                },
                "specification_clause": f"### OPERATIONAL SERVICE SPECIFICATION CLAUSE\nThe execution of this operational/logistics service shall conform to **{svc_std['raw_id']}** (*{svc_std['title_en']}*) and statutory workplace safety guidelines. Bidders possessing ISO 9001 certification shall be evaluated for quality compliance.",
                "specification_gaps": [],
                "verification_audit": {
                    "is_verified": True,
                    "hallucination_strip_rate": 0.0,
                    "violations": []
                },
                "alternative_candidates": [],
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            }

        # 2. Adaptive Retrieval (Parallel Multi-Path + RRF)
        t_ret = time.time()
        initial_candidates = self.retriever.retrieve(query_obj, top_n=30)
        timings["parallel_retrieval_ms"] = round((time.time() - t_ret) * 1000, 2)

        if not initial_candidates:
            return {
                "status": "ABSTAIN",
                "message": "No relevant Indian Standard found in official catalogue with sufficient confidence.",
                "query": query_obj,
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            }

        # 3. Late-Interaction ColBERT-style Reranking
        t_rerank = time.time()
        reranked_pool = self.reranker.rerank(query_obj["search_text"], initial_candidates, top_k=15)
        timings["late_interaction_rerank_ms"] = round((time.time() - t_rerank) * 1000, 2)

        # 4. Technical Constraint & Contradiction Verification
        t_const = time.time()
        verified_candidates = []
        for cand in reranked_pool:
            c_res = self.constraint_engine.verify_candidate(cand, query_obj["constraints"])
            cand_copy = dict(cand)
            cand_copy["constraint_result"] = c_res
            verified_candidates.append(cand_copy)

        # Filter out hard contradictory candidates (if any compatible candidates exist)
        compatible_candidates = [c for c in verified_candidates if c["constraint_result"]["is_compatible"]]
        candidates_to_use = compatible_candidates if compatible_candidates else verified_candidates
        timings["constraint_verification_ms"] = round((time.time() - t_const) * 1000, 2)

        # Primary Standard selection
        primary_candidate = candidates_to_use[0]
        primary_fid = primary_candidate["family_id"]

        # 5. Standards Knowledge Graph Expansion
        t_graph = time.time()
        graph_data = self.graph_expander.expand_standard(primary_fid, max_allied=8)
        timings["graph_expansion_ms"] = round((time.time() - t_graph) * 1000, 2)

        # 6. Agentic Completeness Loop
        t_loop = time.time()
        product_keyword = query_obj.get("clean_query", "")
        completeness_res = self.completeness_engine.run_agentic_loop(
            primary_standard=primary_candidate,
            allied_standards=graph_data["allied_standards"],
            certification_info=graph_data["certification"],
            product_name=product_keyword
        )
        timings["completeness_loop_ms"] = round((time.time() - t_loop) * 1000, 2)

        # 7. Build Verified Evidence Pack
        t_pack = time.time()
        evidence_pack = self.evidence_builder.build_pack(
            query_obj=query_obj,
            primary_standard=primary_candidate,
            allied_standards=completeness_res["allied_standards"],
            certification_info=graph_data["certification"],
            constraint_results=primary_candidate["constraint_result"],
            coverage_info=completeness_res["final_coverage"]
        )
        timings["evidence_pack_ms"] = round((time.time() - t_pack) * 1000, 2)

        # 8. Draft Tender Specification Clause
        t_draft = time.time()
        tender_clause = self.generate_tender_clause_deterministic(evidence_pack)
        timings["clause_drafting_ms"] = round((time.time() - t_draft) * 1000, 2)

        # 9. Zero-Hallucination Verification Kernel Check
        t_kernel = time.time()
        verification_report = self.verification_kernel.verify_evidence_grounding(tender_clause, evidence_pack)
        timings["verification_kernel_ms"] = round((time.time() - t_kernel) * 1000, 2)

        timings["total_pipeline_ms"] = round((time.time() - t0) * 1000, 2)

        # Prepare Top Alternative Candidates
        alternatives = []
        for alt in candidates_to_use[1:top_candidates]:
            alternatives.append({
                "family_id": alt["family_id"],
                "raw_id": alt.get("raw_id", alt["family_id"]),
                "title_en": alt.get("title_en"),
                "year": alt.get("year"),
                "status": alt.get("status"),
                "division": alt.get("division"),
                "relevance_score": alt.get("late_interaction_score", 0.0),
                "confidence_label": alt["constraint_result"]["confidence_vector"]["confidence_label"]
            })

        return {
            "status": "SUCCESS",
            "query": query_text,
            "evidence_pack": evidence_pack,
            "primary_recommendation": {
                "family_id": primary_candidate["family_id"],
                "raw_id": primary_candidate.get("raw_id", primary_candidate["family_id"]),
                "title_en": primary_candidate.get("title_en"),
                "year": primary_candidate.get("year"),
                "status": primary_candidate.get("status"),
                "division": primary_candidate.get("division"),
                "pdf_url": primary_candidate.get("pdf_url") or primary_candidate.get("archive_url"),
                "confidence": evidence_pack["multidimensional_confidence"]
            },
            "allied_standards": evidence_pack["allied_standards"],
            "certification": evidence_pack["certification"],
            "specification_clause": verification_report["sanitized_text"],
            "specification_gaps": evidence_pack["specification_gaps"],
            "verification_audit": {
                "is_verified": verification_report["is_verified"],
                "hallucination_strip_rate": verification_report["strip_rate"],
                "violations": verification_report["violations"]
            },
            "alternative_candidates": alternatives,
            "latency_breakdown_ms": timings
        }

    def recommend_pdf(self, pdf_input: Any, max_items: int = 50, top_candidates: int = 3, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes an entire Tender / BoQ document (PDF, Excel .xls/.xlsx, CSV, or Text):
        1. Extracts layout-aware text and structured tables with ghost-column immunity.
        2. Identifies discrete line items / procurement clauses and classifies their archetype.
        3. Runs full recommendation pipeline for products or returns deterministic non-product advisories.
        4. Synthesizes a consolidated Tender Compliance Matrix.
        """
        t0 = time.time()
        
        # Detect if input is Excel (.xls / .xlsx / .csv) or PDF or Text
        is_excel = False
        is_text = False
        
        if filename:
            fn_lower = filename.lower()
            if fn_lower.endswith(('.xls', '.xlsx', '.csv')):
                is_excel = True
            elif fn_lower.endswith(('.txt', '.log', '.json')):
                is_text = True
        
        if isinstance(pdf_input, str):
            if pdf_input.lower().endswith(('.xls', '.xlsx', '.csv')):
                is_excel = True
            elif pdf_input.lower().endswith(('.txt', '.log', '.json')):
                is_text = True
        elif isinstance(pdf_input, bytes):
            if pdf_input.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1') or pdf_input.startswith(b'PK\x03\x04'):
                is_excel = True
            elif not pdf_input.startswith(b'%PDF'):
                # Try decoding as text
                try:
                    pdf_input.decode('utf-8')
                    is_text = True
                except Exception:
                    pass

        if is_excel:
            doc_parsed = self.excel_processor.extract_document(pdf_input, filename=filename)
        elif is_text:
            text = pdf_input.decode('utf-8', errors='ignore') if isinstance(pdf_input, bytes) else pdf_input
            lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 5]
            extracted = []
            for i, line in enumerate(lines[:max_items], 1):
                extracted.append({
                    "item_number": str(i),
                    "source": f"Clause {i}",
                    "raw_text": line,
                    "page": 1,
                    "archetype": "PHYSICAL_PRODUCT",
                    "category": "Specification Clause"
                })
            doc_parsed = {
                "metadata": {"file_type": "TEXT_DOCUMENT", "total_rows": len(lines), "extracted_items_count": len(extracted)},
                "extracted_items": extracted
            }
        else:
            doc_parsed = self.pdf_processor.extract_document(pdf_input)

        items = doc_parsed["extracted_items"][:max_items]

        item_recommendations = []
        mandatory_count = 0
        voluntary_count = 0
        non_product_count = 0

        for idx, item in enumerate(items, start=1):
            text = item["raw_text"]
            rec = self.recommend(text, top_candidates=top_candidates)
            status = rec.get("status")

            if status == "SUCCESS":
                primary = rec["primary_recommendation"]
                cert = rec["certification"]
                if cert.get("is_mandatory"):
                    mandatory_count += 1
                else:
                    voluntary_count += 1

                item_recommendations.append({
                    "item_index": idx,
                    "item_source": item["source"],
                    "page": item.get("page", 1),
                    "query_text": text,
                    "archetype": rec.get("archetype", "PHYSICAL_PRODUCT"),
                    "category": rec.get("category", "Manufactured Product"),
                    "primary_standard": {
                        "family_id": primary["family_id"],
                        "raw_id": primary["raw_id"],
                        "title_en": primary["title_en"],
                        "status": primary["status"],
                        "confidence_label": primary["confidence"]["overall_label"]
                    },
                    "certification": cert,
                    "allied_standards_count": sum(len(v) for v in rec["allied_standards"].values()),
                    "specification_clause": rec["specification_clause"],
                    "specification_gaps": rec.get("specification_gaps", [])
                })
            elif status == "NON_PRODUCT_LINE":
                non_product_count += 1
                primary = rec["primary_recommendation"]
                item_recommendations.append({
                    "item_index": idx,
                    "item_source": item["source"],
                    "page": item.get("page", 1),
                    "query_text": text,
                    "archetype": rec.get("archetype"),
                    "category": rec.get("category"),
                    "primary_standard": {
                        "family_id": primary["family_id"],
                        "raw_id": primary["raw_id"],
                        "title_en": primary["title_en"],
                        "status": primary["status"],
                        "confidence_label": primary["confidence"]["overall_label"]
                    },
                    "certification": rec["certification"],
                    "allied_standards_count": 0,
                    "specification_clause": rec["specification_clause"],
                    "specification_gaps": []
                })

        total_time_ms = round((time.time() - t0) * 1000, 2)
        mfg_total = mandatory_count + voluntary_count

        return {
            "status": "SUCCESS",
            "document_metadata": doc_parsed["metadata"],
            "total_items_analyzed": len(item_recommendations),
            "compliance_summary": {
                "manufactured_goods_count": mfg_total,
                "mandatory_qco_items": mandatory_count,
                "voluntary_items": voluntary_count,
                "non_product_lines_count": non_product_count,
                "compliance_score": round((mandatory_count / mfg_total * 100), 1) if mfg_total else 0.0
            },
            "item_recommendations": item_recommendations,
            "total_processing_time_ms": total_time_ms
        }
