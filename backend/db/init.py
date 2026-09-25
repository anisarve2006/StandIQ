import sys
import argparse
import psycopg
from config import settings

def init_db():
    try:
        # Validate PostgreSQL configuration
        conn_str = f"dbname={settings.postgres_db} user={settings.postgres_user} password={settings.postgres_password} host={settings.postgres_host} port={settings.postgres_port}"
        
        print("Connecting to PostgreSQL...")
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                # Apply schema (dummy for architecture demonstration)
                cur.execute("CREATE TABLE IF NOT EXISTS standards (family_id VARCHAR PRIMARY KEY, title TEXT);")
                conn.commit()
                print("PostgreSQL schema initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize PostgreSQL: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply migrations")
    args = parser.parse_args()
    
    if args.apply:
        init_db()
    else:
        print("Dry run. Use --apply to execute.")
