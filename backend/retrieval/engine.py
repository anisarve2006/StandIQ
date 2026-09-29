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
import re
import json
import time
import copy
from threading import Lock
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
from services.cache_service import query_cache
from services.circuit_breaker import bharatgpt_circuit_breaker
from services.metrics_service import metrics_collector

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
        
        # In-memory recommendation LRU cache
        self._recommend_cache: Dict[tuple, Dict[str, Any]] = {}
        self._recommend_cache_lock = Lock()
        self._max_cache_size = 512
        
        # Initialize local sovereign LLM (BharatGPT-3B Indic)
        self.bharatgpt = None
        try:
            from services.bharatgpt_service import bharatgpt_engine
            self.bharatgpt = bharatgpt_engine
        except Exception as e:
            logger.warning(f"Could not initialize BharatGPT service: {e}")

    def clear_cache(self) -> None:
        """Clear recommendation cache and underlying component caches."""
        with self._recommend_cache_lock:
            self._recommend_cache.clear()
        query_cache.invalidate()
        if hasattr(self.graph_expander, "clear_cache"):
            self.graph_expander.clear_cache()

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
            gazette_txt = f" (Gazette Notification: {cert['gazette_notification']})" if cert.get("gazette_notification") else ""
            lines.append(f"Compliance with **{scheme_title}** is **MANDATORY** pursuant to the Central Government Quality Control Order (QCO): *{cert['applicable_qco']}*{gazette_txt}. The bidder MUST possess a valid BIS licence with CML number at the time of bid submission.")
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

    def recommend(self, query_text: str, top_candidates: int = 5, use_cache: bool = True) -> Dict[str, Any]:
        """
        End-to-End Orchestration Pipeline.
        Returns complete verified recommendation object with sub-millisecond audit metrics.
        Integrated with multi-tier LRU caching and observability metrics.
        """
        t0 = time.time()
        timings = {}

        # 0. Check Multi-Tier LRU Query Cache (Sub-millisecond retrieval)
        cache_key = (self.db_path, query_text.strip(), top_candidates)
        if use_cache:
            with self._recommend_cache_lock:
                if cache_key in self._recommend_cache:
                    cached = copy.deepcopy(self._recommend_cache[cache_key])
                    total_ms = round((time.time() - t0) * 1000, 2)
                    cached["total_time_ms"] = total_ms
                    cached["is_cached"] = True
                    metrics_collector.record_request(total_ms, is_cached=True)
                    return cached

            cached_result = query_cache.get(query_text, {"top_candidates": top_candidates})
            if cached_result is not None:
                cached_copy = copy.deepcopy(cached_result) if isinstance(cached_result, dict) else cached_result
                cached_copy["is_cached"] = True
                total_ms = round((time.time() - t0) * 1000, 2)
                cached_copy["total_time_ms"] = total_ms
                metrics_collector.record_request(total_ms, is_cached=True)
                return cached_copy

        def _return_cached(payload: Dict[str, Any]) -> Dict[str, Any]:
            total_time_ms = payload.get("total_time_ms", round((time.time() - t0) * 1000, 2))
            payload["total_time_ms"] = total_time_ms
            if use_cache:
                with self._recommend_cache_lock:
                    if len(self._recommend_cache) >= self._max_cache_size:
                        self._recommend_cache.pop(next(iter(self._recommend_cache)))
                    self._recommend_cache[cache_key] = copy.deepcopy(payload)
                query_cache.put(query_text, payload, {"top_candidates": top_candidates})
            metrics_collector.record_request(total_time_ms, is_cached=False)
            return payload

        # Multi-Clause Specification / Schedule of Requirements Handling
        clause_pattern = r'(?:^|\n)\s*(\d+)[\.\)]\s+([^\n]+(?:\n(?!\s*\d+[\.\)]\s+)[^\n]+)*)'
        multi_clauses = re.findall(clause_pattern, query_text)
        if len(multi_clauses) >= 2:
            item_recommendations = []
            alternatives = []
            primary_rec = None
            mandatory_count = 0
            voluntary_count = 0

            for c_num, c_body in multi_clauses:
                clean_body = c_body.strip()
                sub_rec = self.recommend(clean_body, top_candidates=1)
                prim = sub_rec.get("primary_recommendation")
                cert = sub_rec.get("certification", {})
                if cert.get("is_mandatory"):
                    mandatory_count += 1
                else:
                    voluntary_count += 1

                if prim and prim.get("family_id") != "NONE":
                    if not primary_rec:
                        primary_rec = prim
                    else:
                        alternatives.append({
                            "family_id": prim.get("family_id"),
                            "raw_id": prim.get("raw_id", prim.get("family_id")),
                            "title_en": prim.get("title_en", ""),
                            "clause_number": int(c_num)
                        })

                item_recommendations.append({
                    "item_index": int(c_num),
                    "clause_number": int(c_num),
                    "requirement": clean_body,
                    "primary_standard": prim,
                    "certification": cert,
                    "allied_standards": sub_rec.get("allied_standards", {}),
                    "specification_clause": sub_rec.get("specification_clause", ""),
                    "specification_gaps": sub_rec.get("specification_gaps", [])
                })

            total_ms = round((time.time() - t0) * 1000, 2)
            return _return_cached({
                "status": "SUCCESS",
                "is_multi_clause": True,
                "total_clauses": len(multi_clauses),
                "query": query_text,
                "primary_recommendation": primary_rec or {},
                "item_recommendations": item_recommendations,
                "alternative_candidates": alternatives,
                "compliance_summary": {
                    "total_items": len(multi_clauses),
                    "mandatory_qco_items": mandatory_count,
                    "voluntary_items": voluntary_count
                },
                "evidence_pack": {
                    "query_summary": {"raw_query": query_text, "recognized_entities": [], "query_type": "MULTI_CLAUSE_SPECIFICATION"},
                    "multi_clause_summary": f"Identified {len(multi_clauses)} discrete technical requirements across Civil Engineering disciplines."
                },
                "allied_standards": {"test_methods": [], "safety_standards": [], "installation_standards": []},
                "certification": {"is_mandatory": mandatory_count > 0, "status": f"{mandatory_count} MANDATORY QCO CLAUSES"},
                "specification_clause": "### MULTI-ITEM CONSTRUCTION SPECIFICATION\nConsolidated standards package generated for all itemized civil requirements.",
                "total_time_ms": total_ms,
                "latency_breakdown_ms": {"multi_clause_pipeline_ms": total_ms}
            })

        # 1. Compile Query (Neuro-symbolic Layer A & B)
        t_compile = time.time()
        query_obj = compile_query(query_text)
        timings["query_compilation_ms"] = round((time.time() - t_compile) * 1000, 2)


        # Archetype Guard (Information-Theoretic Density & Non-Product Sieve)
        archetype = query_obj.get("archetype", "PHYSICAL_PRODUCT")
        arch_details = query_obj.get("archetype_details", {})

        if archetype == "SERVICE_RATE_SLAB":
            return _return_cached({
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
            })

        if archetype == "FINANCIAL_ADJUSTMENT":
            return _return_cached({
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
            })

        if archetype == "CONTRACTUAL_CONDITION":
            return _return_cached({
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
            })

        if archetype == "VAGUE_TENDER_BOILERPLATE":
            return _return_cached({
                "status": "ABSTAIN_VAGUE_QUERY",
                "archetype": "VAGUE_TENDER_BOILERPLATE",
                "category": arch_details.get("category", "Vague / Unspecified Boilerplate"),
                "query": query_text,
                "primary_recommendation": {
                    "family_id": "NONE",
                    "raw_id": "N/A (Unspecified Product)",
                    "title_en": "Insufficient Technical Specification - No Manufactured Product Identified",
                    "status": "NOT_APPLICABLE",
                    "division": "General Procurement Boilerplate",
                    "confidence": {
                        "overall_label": "LOW",
                        "composite_score": 0.0
                    }
                },
                "allied_standards": {"test_methods": [], "safety_standards": [], "installation_standards": []},
                "certification": {
                    "is_mandatory": False,
                    "status": "UNSPECIFIED",
                    "scheme": "None",
                    "applicable_qco": "None"
                },
                "specification_clause": "### VAGUE SPECIFICATION ADVISORY\nThis requirement contains generic procurement boilerplate or commercial adjectives without identifying any specific manufactured product, material, or engineering parameter. The system abstains from recommending a standard.",
                "specification_gaps": ["Missing tangible product noun or engineering classification."],
                "verification_audit": {
                    "is_verified": True,
                    "hallucination_strip_rate": 0.0,
                    "violations": []
                },
                "alternative_candidates": [],
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            })

        if archetype == "SERVICE_OR_LABOUR" and not query_obj.get("exact_is"):
            svc_std = arch_details.get("service_standard", {
                "family_id": "IS/ISO:9001",
                "raw_id": "IS/ISO 9001 : 2015",
                "title_en": "Quality Management Systems - Requirements (Service Governance)",
                "status": "CURRENT"
            })
            return _return_cached({
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
            })

        # 2. Adaptive Retrieval (Parallel Multi-Path + RRF)
        t_ret = time.time()
        initial_candidates = self.retriever.retrieve(query_obj, top_n=30)
        timings["parallel_retrieval_ms"] = round((time.time() - t_ret) * 1000, 2)

        if not initial_candidates:
            return _return_cached({
                "status": "ABSTAIN",
                "message": "No relevant Indian Standard found in official catalogue with sufficient confidence.",
                "query": query_obj,
                "latency_breakdown_ms": timings,
                "total_time_ms": round((time.time() - t0) * 1000, 2)
            })

        # 3. Hard Negative Gating (Pre-Rerank Architecture Layer)
        # Query product = Steel Tube immediately eliminates Pump, Motor, Valve, Cable, Testing Equipment before expensive reranking
        t_const = time.time()
        compatible_candidates = []
        rejected_candidates = []
        for cand in initial_candidates:
            c_res = self.constraint_engine.verify_candidate(
                cand, 
                query_obj["constraints"],
                classification=query_obj.get("classification")
            )
            cand_copy = dict(cand)
            cand_copy["constraint_result"] = c_res
            if c_res["is_compatible"]:
                compatible_candidates.append(cand_copy)
            else:
                rejected_candidates.append(cand_copy)

        # Only pass compatible candidates to reranking; fallback only if empty
        candidates_for_rerank = compatible_candidates if compatible_candidates else initial_candidates
        timings["constraint_verification_ms"] = round((time.time() - t_const) * 1000, 2)

        # 4. Late-Interaction ColBERT-style Reranking
        t_rerank = time.time()
        reranked_pool = self.reranker.rerank(query_obj["search_text"], candidates_for_rerank, top_k=15)
        candidates_to_use = reranked_pool
        timings["late_interaction_rerank_ms"] = round((time.time() - t_rerank) * 1000, 2)


        # Action 4: BharatGPT Ambiguity Arbitration (Judge Agent)
        arbitration_audit = None
        if len(candidates_to_use) >= 2 and self.bharatgpt and self.bharatgpt.is_available():
            score_1 = candidates_to_use[0].get("late_interaction_score", 1.0)
            score_2 = candidates_to_use[1].get("late_interaction_score", 0.0)
            # If candidates are in close contention (within 8% score delta) and not an exact match
            if abs(score_1 - score_2) <= 0.08 and candidates_to_use[0].get("source_channel") != "EXACT_ID":
                t_judge = time.time()
                arb_result = self.bharatgpt.arbitrate_candidates(query_text, candidates_to_use[:3])
                if arb_result:
                    arbitration_audit = arb_result
                    chosen = arb_result["chosen_candidate"]
                    if chosen["family_id"] != candidates_to_use[0]["family_id"]:
                        candidates_to_use = [chosen] + [c for c in candidates_to_use if c["family_id"] != chosen["family_id"]]
                timings["bharatgpt_judge_ms"] = round((time.time() - t_judge) * 1000, 2)

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
                "domain": alt.get("domain"),
                "product_type": alt.get("product_type"),
                "material": alt.get("material"),
                "standard_type": alt.get("standard_type"),
                "relevance_score": alt.get("late_interaction_score", 0.0),
                "confidence_label": alt["constraint_result"]["confidence_vector"]["confidence_label"]
            })

        total_time_ms = round((time.time() - t0) * 1000, 2)
        timings["total_pipeline_ms"] = total_time_ms

        response_payload = {
            "status": "SUCCESS",
            "is_cached": False,
            "query": query_text,
            "evidence_pack": evidence_pack,
            "primary_recommendation": {
                "family_id": primary_candidate["family_id"],
                "raw_id": primary_candidate.get("raw_id", primary_candidate["family_id"]),
                "title_en": primary_candidate.get("title_en"),
                "year": primary_candidate.get("year"),
                "status": primary_candidate.get("status"),
                "division": primary_candidate.get("division"),
                "domain": primary_candidate.get("domain"),
                "product_type": primary_candidate.get("product_type"),
                "material": primary_candidate.get("material"),
                "application": primary_candidate.get("application"),
                "standard_type": primary_candidate.get("standard_type"),
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
            "total_time_ms": total_time_ms,
            "latency_breakdown_ms": timings
        }

        return _return_cached(response_payload)

    def recommend_pdf(self, pdf_input: Any, max_items: int = 50, top_candidates: int = 3, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes an entire Tender / BoQ document (PDF, Excel .xls/.xlsx, CSV, or Text):
        1. Extracts layout-aware text and structured tables with ghost-column immunity.
        2. Identifies discrete line items / procurement clauses and classifies their archetype.
        3. Runs full recommendation pipeline for products or returns deterministic non-product advisories.
        4. Synthesizes a consolidated Tender Compliance Matrix.
        """
        t0 = time.time()
        
        is_excel = False
        is_text = False
        is_image = False
        
        image_extensions = ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif')

        if filename:
            fn_lower = filename.lower()
            if fn_lower.endswith(('.xls', '.xlsx', '.csv')):
                is_excel = True
            elif fn_lower.endswith(('.txt', '.log', '.json')):
                is_text = True
            elif fn_lower.endswith(image_extensions):
                is_image = True
        
        if isinstance(pdf_input, str):
            if pdf_input.lower().endswith(('.xls', '.xlsx', '.csv')):
                is_excel = True
            elif pdf_input.lower().endswith(('.txt', '.log', '.json')):
                is_text = True
            elif pdf_input.lower().endswith(image_extensions):
                is_image = True
        elif isinstance(pdf_input, bytes):
            if pdf_input.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1') or pdf_input.startswith(b'PK\x03\x04'):
                is_excel = True
            elif (
                pdf_input.startswith(b'\x89PNG\r\n\x1a\n') or
                pdf_input.startswith(b'\xff\xd8\xff') or
                pdf_input.startswith(b'RIFF') and b'WEBP' in pdf_input[:14] or
                pdf_input.startswith(b'BM') or
                pdf_input.startswith(b'II*\x00') or
                pdf_input.startswith(b'MM\x00*')
            ):
                is_image = True
            elif not pdf_input.startswith(b'%PDF'):
                # Try decoding as text
                try:
                    pdf_input.decode('utf-8')
                    is_text = True
                except Exception:
                    pass

        if is_image:
            doc_parsed = self.pdf_processor.extract_image_document(pdf_input)
        elif is_excel:
            doc_parsed = self.excel_processor.extract_document(pdf_input, filename=filename)
        elif is_image:
            doc_parsed = self.pdf_processor.extract_image(pdf_input, filename=filename)
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
                "metadata": {"file_type": "TEXT_DOCUMENT", "total_rows": len(lines), "extracted_items_count": len(extracted), "extraction_mode": "DIGITAL", "is_scanned": False},
                "extracted_items": extracted
            }
        else:
            doc_parsed = self.pdf_processor.extract_document(pdf_input)

        items = doc_parsed["extracted_items"][:max_items]

        # 0. Global Document Pre-Scan: Detect Section-Wide Anchor Standard and Primary Product
        full_doc_text = " \n ".join([it["raw_text"] for it in items])
        doc_anchor_rec = None
        anchor_product_words = set()
        if len(items) > 1:
            try:
                candidate_anchor = self.recommend(full_doc_text, top_candidates=top_candidates)
                if candidate_anchor.get("status") == "SUCCESS":
                    doc_anchor_rec = candidate_anchor
                    anchor_title = (doc_anchor_rec["primary_recommendation"].get("title_en") or "").lower()
                    anchor_product_words = set(re.findall(r'[a-zA-Z]{4,}', anchor_title)) - {
                        "specification", "general", "requirements", "standard", "standards", "method", "methods"
                    }
            except Exception as e:
                logger.warning(f"Document pre-scan failed: {e}")

        item_recommendations = []
        mandatory_count = 0
        voluntary_count = 0
        non_product_count = 0

        for idx, item in enumerate(items, start=1):
            text = item["raw_text"]
            text_lower = text.lower()

            # Check if this item is a subordinate clause of the document-wide item specification
            is_subordinate_clause = False
            if doc_anchor_rec and anchor_product_words:
                shares_product_noun = bool(set(re.findall(r'[a-zA-Z]{4,}', text_lower)) & anchor_product_words)
                is_clause_pattern = any(text_lower.startswith(p) for p in [
                    "the ", "all ", "shall ", "each ", "in accordance", "sampling ", "testing ", "compressive "
                ]) or any(k in text_lower for k in [
                    "shall be", "shall conform", "shall have", "shall satisfy", "tested in accordance", "provide test certificates"
                ])
                if shares_product_noun or is_clause_pattern:
                    is_subordinate_clause = True

            if is_subordinate_clause and doc_anchor_rec:
                # Inherit the document's verified governing standard instead of running isolated wild search
                rec = dict(doc_anchor_rec)
                # If clause is specifically about acceptance testing, feature the allied test method
                if any(k in text_lower for k in ["test", "testing", "tested", "absorption", "efflorescence", "compressive strength"]):
                    test_methods = doc_anchor_rec.get("allied_standards", {}).get("test_methods", [])
                    if test_methods:
                        primary_test = test_methods[0]
                        rec["primary_recommendation"] = dict(primary_test)
                        rec["category"] = "Acceptance Testing Standard"
            else:
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
