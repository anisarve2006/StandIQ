import os
import tempfile
import pytest
from data_pipeline.load_database import populate_sqlite

@pytest.fixture(scope="session")
def test_db_path():
    # Create a temporary file for sqlite database
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    # Synthetic Standards
    synthetic_standards = [
        {
            "family_id": "IS:1786",
            "prefix": "IS",
            "number": "1786",
            "part": None,
            "section": None,
            "title_en": "High strength deformed steel bars and wires for concrete reinforcement",
            "title_hi": "",
            "scope_text": "This standard specifies requirements for high strength deformed steel bars and wires for use as reinforcement in concrete.",
            "committee": "Civil Engineering Department",
            "committee_code": "CED 54",
            "division": "Civil Engineering",
            "tier": "CATALOGUE_EVIDENCE",
            "raw_id": "IS 1786 : 2008",
            "status": "CURRENT",
            "num_amendments": 2,
            "year": 2008,
            "archive_url": "",
            "pdf_url": ""
        },
        {
            "family_id": "IS:8112",
            "prefix": "IS",
            "number": "8112",
            "part": None,
            "section": None,
            "title_en": "Ordinary Portland Cement, 43 Grade - Specification",
            "title_hi": "",
            "scope_text": "Cement testing and specification.",
            "committee": "Cement and Concrete",
            "committee_code": "CED 2",
            "division": "Civil Engineering",
            "tier": "CATALOGUE_EVIDENCE",
            "raw_id": "IS 8112 : 2013",
            "status": "SUPERSEDED",
            "num_amendments": 0,
            "year": 2013,
            "superceded_by": "269"
        },
        {
            "family_id": "IS:269",
            "prefix": "IS",
            "number": "269",
            "part": None,
            "section": None,
            "title_en": "Ordinary Portland Cement - Specification",
            "title_hi": "",
            "scope_text": "Cement testing and specification.",
            "committee": "Cement and Concrete",
            "committee_code": "CED 2",
            "division": "Civil Engineering",
            "tier": "CATALOGUE_EVIDENCE",
            "raw_id": "IS 269 : 2015",
            "status": "CURRENT",
            "num_amendments": 0,
            "year": 2015
        },
        {
            "family_id": "IS:1608",
            "prefix": "IS",
            "number": "1608",
            "part": "1",
            "section": None,
            "title_en": "Metallic Materials - Tensile Testing Part 1 Method of Test at Room Temperature",
            "title_hi": "",
            "scope_text": "Method of test for steel.",
            "committee": "Civil Engineering Department",
            "committee_code": "CED 54",
            "division": "Civil Engineering",
            "tier": "CATALOGUE_EVIDENCE",
            "raw_id": "IS 1608 (Part 1) : 2018",
            "status": "CURRENT",
            "num_amendments": 0,
            "year": 2018
        }
    ]

    # Synthetic QCOs
    synthetic_qcos = [
        {
            "scheme": "Scheme I",
            "category": "Steel",
            "sr_no": "1",
            "raw_is_no": "IS 1786 : 2008",
            "family_id": "IS:1786",
            "product_name": "Steel Bars",
            "gazette_notification": "S.O. 1234(E)",
            "status": "IN_FORCE",
            "source_url": ""
        }
    ]

    populate_sqlite(synthetic_standards, synthetic_qcos, db_path=path)

    yield path

    # Cleanup
    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass
