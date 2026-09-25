from typing import List, Dict, Any
from .base import GraphRepository

try:
    from neo4j import GraphDatabase
except ImportError:
    GraphDatabase = None

class Neo4jGraphRepository(GraphRepository):
    def __init__(self, uri: str, user: str, password: str):
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = GraphDatabase.driver(uri, auth=(user, password)) if GraphDatabase else None

    def get_related_standards(self, family_id: str, edge_types: List[str] = None) -> List[Dict[str, Any]]:
        if not self.driver:
            return []
            
        try:
            with self.driver.session() as session:
                query = "MATCH (s:Standard {family_id: $id})-[r]->(t:Standard) RETURN type(r) AS type, t.family_id AS target"
                result = session.run(query, id=family_id)
                relations = []
                for record in result:
                    edge_type = record["type"]
                    if edge_types and edge_type not in edge_types:
                        continue
                    relations.append({
                        "source": family_id,
                        "target": record["target"],
                        "type": edge_type,
                        "provenance": "Neo4j Graph Database"
                    })
                return relations
        except Exception:
            return []
