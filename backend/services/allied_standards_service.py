from typing import List, Dict, Any
from repositories.base import GraphRepository
from schemas.api import AlliedStandardResponse, AlliedStandardsResponse, AlliedStandardItem, CategorizedAlliedStandards

class AlliedStandardsService:
    def __init__(self, repository: GraphRepository):
        self.repository = repository

    def get_allied_standards_categorized(self, family_id: str) -> AlliedStandardsResponse:
        """Classifies allied standards into the 5 core Problem Statement categories:
        1. NORMATIVE_REFERENCE
        2. TEST_METHOD
        3. SAFETY_CODE
        4. INSTALLATION_CODE
        5. TERMINOLOGY_GLOSSARY
        """
        graph_data = self.repository.get_allied_standards(family_id)
        flat_results = []
        categories = CategorizedAlliedStandards()

        for edge in graph_data:
            role = edge.get("edge_type", "").upper()
            title = edge.get("title_en") or ""
            title_lower = title.lower()
            dst_id = edge.get("dst_family_id") or ""
            prov = edge.get("provenance")
            year = edge.get("year")
            status = edge.get("status")

            # Determine 5-category classification
            if "TEST" in role or "method of test" in title_lower or "testing" in title_lower or "determination of" in title_lower:
                rel_type = "TEST_METHOD"
            elif "SAFETY" in role or "safety" in title_lower or "earthing" in title_lower or "fire protection" in title_lower:
                rel_type = "SAFETY_CODE"
            elif "INSTALLATION" in role or "INSTALLED_PER" in role or "installation" in title_lower or "laying" in title_lower or "erection" in title_lower or "falsework" in title_lower:
                rel_type = "INSTALLATION_CODE"
            elif "GLOSSARY" in role or "TERMINOLOGY" in role or "glossary" in title_lower or "terminology" in title_lower or "vocabulary" in title_lower or "symbols" in title_lower:
                rel_type = "TERMINOLOGY_GLOSSARY"
            else:
                rel_type = "NORMATIVE_REFERENCE"

            # Create standard item
            item = AlliedStandardItem(
                standard_id=dst_id,
                title=title,
                relationship=rel_type,
                provenance=prov,
                year=year,
                status=status
            )

            # Route to respective category bucket
            if rel_type == "TEST_METHOD":
                categories.test_methods.append(item)
            elif rel_type == "SAFETY_CODE":
                categories.safety_codes.append(item)
            elif rel_type == "INSTALLATION_CODE":
                categories.installation_codes.append(item)
            elif rel_type == "TERMINOLOGY_GLOSSARY":
                categories.terminology_glossaries.append(item)
            else:
                categories.normative_references.append(item)

            flat_results.append(AlliedStandardResponse(
                source_standard=family_id,
                relationship=rel_type,
                target_standard=dst_id,
                reason=title,
                evidence=prov
            ))

        return AlliedStandardsResponse(
            family_id=family_id,
            categories=categories,
            allied_standards=flat_results
        )

    def get_allied_standards(self, family_id: str) -> List[AlliedStandardResponse]:
        """Legacy helper returning flat list."""
        resp = self.get_allied_standards_categorized(family_id)
        return resp.allied_standards

