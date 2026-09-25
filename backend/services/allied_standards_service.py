from typing import List
from retrieval.graph_expander import GraphExpander
from schemas.api import AlliedStandardResponse

class AlliedStandardsService:
    def __init__(self, db_path: str):
        self.graph_expander = GraphExpander(db_path)

    def get_allied_standards(self, family_id: str) -> List[AlliedStandardResponse]:
        graph_data = self.graph_expander.expand_standard(family_id, max_allied=50)
        results = []
        for edge in graph_data.get("allied_standards", []):
            role = edge.get("edge_type", "").upper()
            rel_type = "RELATED_PRODUCT"
            if "TEST" in role:
                rel_type = "TEST_METHOD"
            elif "SAFETY" in role:
                rel_type = "SAFETY"
            elif "INSTALLATION" in role:
                rel_type = "INSTALLATION"
            elif "NORMATIVE" in role or "REFERENCES" in role:
                rel_type = "NORMATIVE_REFERENCE"
                
            results.append(AlliedStandardResponse(
                source_standard=family_id,
                relationship=rel_type,
                target_standard=edge.get("dst_family_id") or edge.get("family_id"),
                reason=edge.get("title_en"),
                evidence=edge.get("provenance")
            ))
        return results
