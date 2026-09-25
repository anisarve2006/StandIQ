from typing import List
from repositories.base import GraphRepository
from schemas.api import AlliedStandardResponse

class AlliedStandardsService:
    def __init__(self, repository: GraphRepository):
        self.repository = repository

    def get_allied_standards(self, family_id: str) -> List[AlliedStandardResponse]:
        graph_data = self.repository.get_allied_standards(family_id)
        results = []
        for edge in graph_data:
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
                target_standard=edge.get("dst_family_id"),
                reason=edge.get("title_en"),
                evidence=edge.get("provenance")
            ))
        return results
