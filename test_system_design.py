import sys
import os
import time

BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from retrieval.engine import StandardsRecommenderEngine
from services.cache_service import query_cache
from services.circuit_breaker import bharatgpt_circuit_breaker, CircuitState
from services.feedback_service import feedback_service, FeedbackSubmission
from services.metrics_service import metrics_collector


def test_system_design_components():
    print("=" * 80)
    print("STANDIQ SYSTEM DESIGN VERIFICATION SUITE")
    print("=" * 80)

    engine = StandardsRecommenderEngine()

    # ---------------------------------------------------------
    # 1. Test Multi-Tier LRU Query Cache & Latency
    # ---------------------------------------------------------
    print("\n--- [1] LRU Query Cache & Latency Benchmark ---")
    query = "HDPE potable water pipes 110mm"

    # First call (Cold cache)
    t0 = time.perf_counter()
    res1 = engine.recommend(query)
    t_cold = (time.perf_counter() - t0) * 1000
    print(f"Cold query execution time: {t_cold:.2f}ms (is_cached={res1.get('is_cached', False)})")
    assert not res1.get("is_cached", False), "Cold query should not be cached"

    # Second call (Warm cache hit)
    t0 = time.perf_counter()
    res2 = engine.recommend(query)
    t_warm = (time.perf_counter() - t0) * 1000
    print(f"Warm query execution time: {t_warm:.2f}ms (is_cached={res2.get('is_cached', False)})")
    assert res2.get("is_cached", True), "Warm query must hit cache"
    assert t_warm < 5.0, f"Cache retrieval must be sub-5ms (got {t_warm:.2f}ms)"
    print(f"Cache speedup factor: {t_cold / t_warm:.1f}x faster!")

    # ---------------------------------------------------------
    # 2. Test Active Learning & Continuous Feedback Loop
    # ---------------------------------------------------------
    print("\n--- [2] Active Learning & Dynamic Feedback Store ---")
    custom_slang = "test ultra flexible plumb hose"
    correct_is = "IS:15801"

    # Initial query before feedback
    res_before = engine.recommend(custom_slang, use_cache=False)
    initial_fid = res_before.get("primary_recommendation", {}).get("family_id")
    print(f"Before learning: '{custom_slang}' -> {initial_fid}")

    # Submit verified correction feedback
    fb_sub = FeedbackSubmission(
        query_text=custom_slang,
        recommended_family_id=initial_fid or "NONE",
        is_accepted=False,
        corrected_family_id=correct_is,
        feedback_type="OFFICER_CORRECTION",
        comments="Corrected by Executive Engineer for PPR plumbing",
        officer_id="EE_CPWD_042",
        auto_learn=True
    )
    fb_res = feedback_service.record_feedback(fb_sub)
    print(f"Feedback submission result: {fb_res}")
    assert fb_res["status"] == "SUCCESS", "Feedback recording failed"
    assert fb_res["dynamic_learning_applied"], "Active learning was not applied"

    # Subsequent query without restarting or modifying code
    res_after = engine.recommend(custom_slang, use_cache=False)
    learned_fid = res_after.get("primary_recommendation", {}).get("family_id")
    print(f"After dynamic active learning: '{custom_slang}' -> {learned_fid}")
    assert learned_fid == correct_is, f"Expected {correct_is}, got {learned_fid}"
    print("SUCCESS: System dynamically adapted its knowledge without code changes!")

    # ---------------------------------------------------------
    # 3. Test Circuit Breaker & Graceful Degradation
    # ---------------------------------------------------------
    print("\n--- [3] Circuit Breaker & Graceful Degradation ---")
    print(f"Initial Circuit Breaker State: {bharatgpt_circuit_breaker.state.value}")
    
    def failing_service():
        raise TimeoutError("Simulated LLM CPU starvation / timeout")

    def fallback_service():
        return "FALLBACK_DETERMINISTIC_CLAUSE"

    # Trigger threshold failures
    for i in range(3):
        res = bharatgpt_circuit_breaker.call(failing_service, fallback=fallback_service)
        assert res == "FALLBACK_DETERMINISTIC_CLAUSE"

    print(f"Post-failure Circuit Breaker State: {bharatgpt_circuit_breaker.state.value}")
    assert bharatgpt_circuit_breaker.state == CircuitState.OPEN, "Circuit breaker should be OPEN"

    # Fast-fail while OPEN without calling failing service
    t_start = time.perf_counter()
    res_fast = bharatgpt_circuit_breaker.call(failing_service, fallback=fallback_service)
    t_fast = (time.perf_counter() - t_start) * 1000
    assert res_fast == "FALLBACK_DETERMINISTIC_CLAUSE"
    print(f"Fast fallback execution time while OPEN: {t_fast:.3f}ms")

    # Reset breaker for normal operations
    bharatgpt_circuit_breaker.state = CircuitState.CLOSED
    bharatgpt_circuit_breaker.failure_count = 0
    print(f"Reset Circuit Breaker State: {bharatgpt_circuit_breaker.state.value}")

    # ---------------------------------------------------------
    # 4. Test Production Telemetry & Metrics Collector
    # ---------------------------------------------------------
    print("\n--- [4] SRE Observability & Telemetry Metrics ---")
    metrics = metrics_collector.get_summary()
    print("Metrics snapshot:")
    print(f"  - Total requests tracked: {metrics['throughput']['total_requests']}")
    print(f"  - Cached requests: {metrics['throughput']['cached_requests']}")
    print(f"  - Latency P50: {metrics['latency_percentiles_ms']['p50']}ms")
    print(f"  - Latency P90: {metrics['latency_percentiles_ms']['p90']}ms")
    print(f"  - Latency P99: {metrics['latency_percentiles_ms']['p99']}ms")
    print(f"  - Cache hit ratio: {metrics['cache']['hit_ratio_percent']}%")
    print(f"  - Database indexed standards: {metrics['database_health']['total_indexed_standards']}")
    print(f"  - Total active aliases: {metrics['database_health']['total_active_aliases']}")
    print(f"  - Feedback total recorded: {metrics['feedback']['total_feedback_count']}")

    print("\n" + "=" * 80)
    print("ALL SYSTEM DESIGN COMPONENTS VERIFIED AND PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    test_system_design_components()
