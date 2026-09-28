import time
import pytest
from retrieval.engine import StandardsRecommenderEngine
from retrieval.graph_expander import GraphExpander

def test_graph_expander_caching(test_db_path):
    expander = GraphExpander(db_path=test_db_path)
    expander.clear_cache()
    
    # First call
    t0 = time.time()
    res1 = expander.expand_standard("IS:1786", max_allied=5)
    dur1 = time.time() - t0
    
    assert res1["family_id"] == "IS:1786"
    assert "certification" in res1
    
    # Second call (cached)
    t1 = time.time()
    res2 = expander.expand_standard("IS:1786", max_allied=5)
    dur2 = time.time() - t1
    
    assert res2["family_id"] == "IS:1786"
    assert res1 == res2
    assert dur2 <= dur1
    
    # Mutation safety (deepcopy isolation)
    res1["allied_standards"].append({"fake": True})
    assert len(res1["allied_standards"]) != len(res2["allied_standards"])
    
    # Cache clear
    expander.clear_cache()
    assert len(expander._cache) == 0

def test_engine_recommend_caching(test_db_path):
    engine = StandardsRecommenderEngine(db_path=test_db_path)
    engine.clear_cache()
    
    query = "rebar for construction"
    
    # First call
    res1 = engine.recommend(query, top_candidates=3)
    assert res1["status"] == "SUCCESS"
    assert res1["primary_recommendation"]["family_id"] == "IS:1786"
    
    # Second call should be lightning fast from in-memory cache
    res2 = engine.recommend(query, top_candidates=3)
    assert res2["status"] == "SUCCESS"
    assert res2["primary_recommendation"]["family_id"] == "IS:1786"
    assert res2["total_time_ms"] < 25.0  # In-memory cached lookup is sub-25ms
    
    # Mutation safety
    res1["mutated_field"] = "tainted"
    assert "mutated_field" not in res2
    
    # Engine clear_cache
    engine.clear_cache()
    assert len(engine._recommend_cache) == 0
