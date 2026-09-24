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
        
        # Initialize Groq client if key is configured
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_client = None
        if self.groq_api_key and self.groq_api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=self.groq_api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Groq client: {e}")

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
        Synthesizes the explanation and GeM tender clause using Groq Llama 3.3 70B.
        Prompt strictly confines LLM to facts inside evidence_pack.
        """
        if not self.groq_client:
            return self.generate_tender_clause_deterministic(evidence_pack)

        system_prompt = (
            "You are the Chief Standards Officer for the Government of India e-Marketplace (GeM). "
            "You draft rigorous, legally sound tender clauses grounded ONLY in the provided Evidence Pack. "
            "OPERATING INVARIANTS:\n"
            "1. You must ONLY cite Indian Standard numbers (IS) that are explicitly listed in the Evidence Pack.\n"
            "2. Never hallucinate, guess, or inject any standard numbers.\n"
            "3. If a QCO is marked MANDATORY in the pack, state the exact Gazette notification.\n"
            "4. Output a clean, professional markdown document with (A) Executive Technical Recommendation, "
            "(B) 5-Point Compliant Tender Specification Clause, and (C) Technical Gap Advisory."
        )

        user_prompt = f"Evidence Pack:\n```json\n{json.dumps(evidence_pack, indent=2)}\n```\n\nGenerate the complete technical procurement recommendation."

        try:
            response = self.groq_client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Groq generation failed, falling back to deterministic: {e}")
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

    def recommend_pdf(self, pdf_input: Any, max_items: int = 10, top_candidates: int = 3) -> Dict[str, Any]:
        """
        Processes an entire Tender / BoQ PDF document:
        1. Extracts layout-aware text and structured tables.
        2. Identifies discrete line items / procurement clauses.
        3. Runs full 12-layer recommendation pipeline for each item.
        4. Synthesizes a consolidated Tender Compliance Matrix.
        """
        t0 = time.time()
        doc_parsed = self.pdf_processor.extract_document(pdf_input)
        items = doc_parsed["extracted_items"][:max_items]

        item_recommendations = []
        mandatory_count = 0
        voluntary_count = 0

        for idx, item in enumerate(items, start=1):
            text = item["raw_text"]
            rec = self.recommend(text, top_candidates=top_candidates)
            if rec.get("status") == "SUCCESS":
                primary = rec["primary_recommendation"]
                cert = rec["certification"]
                if cert.get("is_mandatory"):
                    mandatory_count += 1
                else:
                    voluntary_count += 1

                item_recommendations.append({
                    "item_index": idx,
                    "item_source": item["source"],
                    "page": item["page"],
                    "query_text": text,
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
                    "specification_gaps": rec["specification_gaps"]
                })

        total_time_ms = round((time.time() - t0) * 1000, 2)

        return {
            "status": "SUCCESS",
            "document_metadata": doc_parsed["metadata"],
            "total_items_analyzed": len(item_recommendations),
            "compliance_summary": {
                "mandatory_qco_items": mandatory_count,
                "voluntary_items": voluntary_count,
                "compliance_score": round((mandatory_count / len(item_recommendations) * 100), 1) if item_recommendations else 0.0
            },
            "item_recommendations": item_recommendations,
            "total_processing_time_ms": total_time_ms
        }
