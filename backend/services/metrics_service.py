"""
Production Observability, Telemetry & Performance Metrics Service.
System Design Pattern: Metrics Collector & SRE Instrumentation.
"""

import time
import os
import sqlite3
from typing import Dict, Any, List
from threading import RLock

from services.cache_service import query_cache
from services.circuit_breaker import bharatgpt_circuit_breaker
from services.feedback_service import feedback_service

START_TIME = time.time()
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "standards.db")


class MetricsCollector:
    """Thread-safe collector for request latencies and system throughput."""
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._lock = RLock()
        self.total_requests = 0
        self.cached_requests = 0
        self.degraded_requests = 0
        self.latencies_ms: List[float] = []
        self._max_latency_samples = 1000

    def record_request(self, latency_ms: float, is_cached: bool = False, is_degraded: bool = False):
        with self._lock:
            self.total_requests += 1
            if is_cached:
                self.cached_requests += 1
            if is_degraded:
                self.degraded_requests += 1

            self.latencies_ms.append(latency_ms)
            if len(self.latencies_ms) > self._max_latency_samples:
                self.latencies_ms.pop(0)

    def get_summary(self) -> Dict[str, Any]:
        with self._lock:
            uptime_seconds = round(time.time() - START_TIME, 1)
            sorted_latencies = sorted(self.latencies_ms) if self.latencies_ms else [0.0]
            n = len(sorted_latencies)

            p50 = round(sorted_latencies[int(n * 0.50)], 2) if n > 0 else 0.0
            p90 = round(sorted_latencies[min(int(n * 0.90), n - 1)], 2) if n > 0 else 0.0
            p99 = round(sorted_latencies[min(int(n * 0.99), n - 1)], 2) if n > 0 else 0.0
            avg_latency = round(sum(sorted_latencies) / n, 2) if n > 0 else 0.0

            # DB metrics
            std_count = 0
            alias_count = 0
            try:
                conn = sqlite3.connect(self.db_path)
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) FROM standards;")
                std_count = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM standard_aliases;")
                alias_count = cur.fetchone()[0]
                conn.close()
            except Exception:
                pass

            return {
                "uptime_seconds": uptime_seconds,
                "throughput": {
                    "total_requests": self.total_requests,
                    "cached_requests": self.cached_requests,
                    "degraded_requests": self.degraded_requests,
                    "active_samples": n
                },
                "latency_percentiles_ms": {
                    "avg": avg_latency,
                    "p50": p50,
                    "p90": p90,
                    "p99": p99
                },
                "cache": query_cache.get_stats(),
                "circuit_breaker": bharatgpt_circuit_breaker.get_status(),
                "feedback": feedback_service.get_feedback_metrics(),
                "database_health": {
                    "total_indexed_standards": std_count,
                    "total_active_aliases": alias_count,
                    "storage_engine": "SQLite FTS5 + BGE Vector Embeddings"
                }
            }


metrics_collector = MetricsCollector()
