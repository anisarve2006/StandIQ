import os
import psycopg2
from config import settings

def init_postgres():
    conn_str = f"dbname={settings.postgres_db} user={settings.postgres_user} password={settings.postgres_password} host={settings.postgres_host} port={settings.postgres_port}"
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        
        # Actual PostgreSQL schema creation
        cur.execute("""
        CREATE TABLE IF NOT EXISTS standards (
            family_id VARCHAR PRIMARY KEY,
            title_en TEXT,
            status VARCHAR,
            year INT
        );
        
        CREATE TABLE IF NOT EXISTS standard_versions (
            id SERIAL PRIMARY KEY,
            family_id VARCHAR REFERENCES standards(family_id),
            version VARCHAR,
            status VARCHAR,
            effective_date DATE,
            supersedes VARCHAR
        );
        
        CREATE TABLE IF NOT EXISTS regulatory_rules (
            id SERIAL PRIMARY KEY,
            family_id VARCHAR REFERENCES standards(family_id),
            scheme VARCHAR,
            product_name TEXT,
            status VARCHAR
        );
        
        CREATE TABLE IF NOT EXISTS edges (
            id SERIAL PRIMARY KEY,
            src_family_id VARCHAR REFERENCES standards(family_id),
            dst_family_id VARCHAR,
            edge_type VARCHAR,
            provenance TEXT
        );
        
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'PROCUREMENT_OFFICER',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            revoked_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
        """)
        conn.commit()
        print("PostgreSQL schema initialized successfully.")
    except Exception as e:
        print(f"PostgreSQL initialization failed or not available: {e}")

if __name__ == "__main__":
    init_postgres()
