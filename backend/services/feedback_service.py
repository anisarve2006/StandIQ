"""
Active Learning & Continuous Feedback Ingestion Service.
System Design Pattern: Human-in-the-Loop Feedback Loop with Zero-Downtime Cache Invalidation.
"""

import os
import sqlite3
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from loguru import logger

from repositories.alias_repository import alias_repository
from services.cache_service import query_cache

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "standards.db")


class FeedbackSubmission(BaseModel):
    query_text: str = Field(..., description="Original item description or procurement requirement")
    recommended_family_id: str = Field(..., description="The standard family ID recommended by the engine")
    is_accepted: bool = Field(True, description="True if recommendation was accurate, False if corrected")
    corrected_family_id: Optional[str] = Field(None, description="The correct standard family ID if corrected")
    feedback_type: str = Field("USER_VERIFIED", description="USER_VERIFIED, AUDIT_OVERRIDE, or DEFECT_REPORT")
    comments: Optional[str] = Field(None, description="Optional notes or procurement justification")
    officer_id: Optional[str] = Field("procurement_officer_demo", description="Identifier of the reviewer")
    auto_learn: bool = Field(True, description="If True, automatically registers valid correction as learned alias")


class FeedbackService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._ensure_table()

    def _ensure_table(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute("""
            CREATE TABLE IF NOT EXISTS user_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT NOT NULL,
                recommended_family_id TEXT,
                accepted INTEGER DEFAULT 1,
                corrected_family_id TEXT,
                feedback_type TEXT,
                comments TEXT,
                officer_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"[FeedbackService] Failed to initialize feedback table: {e}")

    def record_feedback(self, submission: FeedbackSubmission) -> Dict[str, Any]:
        """
        Records human feedback and triggers dynamic active learning if a verified correction was supplied.
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute("""
            INSERT INTO user_feedback (
                query_text, recommended_family_id, accepted, corrected_family_id, feedback_type, comments, officer_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                submission.query_text.strip(),
                submission.recommended_family_id,
                1 if submission.is_accepted else 0,
                submission.corrected_family_id.strip() if submission.corrected_family_id else None,
                submission.feedback_type,
                submission.comments,
                submission.officer_id
            ))
            feedback_id = cur.lastrowid
            conn.commit()
            conn.close()

            # Active Learning Hook: If user corrected the recommendation, learn the association dynamically
            learned = False
            if submission.auto_learn and not submission.is_accepted and submission.corrected_family_id:
                clean_term = submission.query_text.strip().lower()
                corrected_fid = submission.corrected_family_id.strip().upper()
                if not corrected_fid.startswith("IS:"):
                    corrected_fid = f"IS:{corrected_fid.replace('IS ', '').replace('IS', '')}"

                # Register in standard_aliases with immediate cache invalidation
                alias_repository.save_learned_alias(
                    alias_term=clean_term,
                    family_id=corrected_fid,
                    product_name=submission.comments or clean_term,
                    division="User Verified Correction",
                    source=f"FEEDBACK_OFFICER_{submission.officer_id}",
                    review_status="VERIFIED"
                )
                # Invalidate Query LRU Cache so immediate subsequent searches use the new alias
                query_cache.invalidate(clean_term)
                learned = True
                logger.info(f"[FeedbackService] Dynamic active learning applied: '{clean_term}' -> {corrected_fid}")

            return {
                "status": "SUCCESS",
                "feedback_id": feedback_id,
                "dynamic_learning_applied": learned,
                "message": "Feedback recorded. Engine updated dynamically." if learned else "Feedback recorded successfully."
            }

        except Exception as e:
            logger.error(f"[FeedbackService] Error recording feedback: {e}")
            return {
                "status": "ERROR",
                "message": str(e)
            }

    def get_feedback_metrics(self) -> Dict[str, Any]:
        """Calculates accuracy rate and total feedback telemetry."""
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM user_feedback;")
            total = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM user_feedback WHERE accepted = 1;")
            accepted = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM user_feedback WHERE accepted = 0 AND corrected_family_id IS NOT NULL;")
            corrections = cur.fetchone()[0]

            conn.close()

            acceptance_rate = round((accepted / total) * 100, 2) if total > 0 else 100.0

            return {
                "total_feedback_count": total,
                "accepted_count": accepted,
                "corrected_count": corrections,
                "acceptance_rate_percent": acceptance_rate
            }
        except Exception as e:
            logger.error(f"[FeedbackService] Error getting metrics: {e}")
            return {
                "total_feedback_count": 0,
                "acceptance_rate_percent": 100.0
            }


feedback_service = FeedbackService()
