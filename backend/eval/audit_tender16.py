import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ["USE_BHARATGPT"] = "false"

from retrieval.engine import StandardsRecommenderEngine

engine = StandardsRecommenderEngine()
res = engine.recommend_pdf("TEST_DATA/tender16.pdf", max_items=45)

items = res["item_recommendations"]
print(f"Total items analyzed: {len(items)}\n")

for it in items:
    idx = it["item_index"]
    txt = it["query_text"]
    prim = it["primary_standard"]
    cert = it["certification"]
    arch = it.get("archetype")
    print(f"[{idx:02d}] {txt[:75]}...")
    print(f"     -> Rec: {prim.get('raw_id')} | Title: {prim.get('title_en')[:60]}... | Arch: {arch}")
    print(f"     -> QCO: {cert.get('status')} [{cert.get('scheme')}]")
