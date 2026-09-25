import argparse

def build_graph(dry_run: bool, limit: int, rebuild: bool):
    print("Initializing Neo4j graph projection pipeline...")
    if dry_run:
        print("[DRY-RUN] Would fetch standard relationships from PostgreSQL.")
        print("[DRY-RUN] Would MERGE nodes and edges in Neo4j.")
        return
        
    print("Awaiting real BIS data source...")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--rebuild", action="store_true")
    args = parser.parse_args()
    
    build_graph(args.dry_run, args.limit, args.rebuild)
