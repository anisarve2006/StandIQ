import pytest
import psycopg2
from config import settings
from db.init import init_postgres

# Fixture to get a fresh DB connection and ensure schema is initialized
@pytest.fixture(scope="module")
def db_connection():
    init_postgres()
    conn_str = f"dbname={settings.postgres_db} user={settings.postgres_user} password={settings.postgres_password} host={settings.postgres_host} port={settings.postgres_port}"
    try:
        conn = psycopg2.connect(conn_str)
    except Exception as e:
        pytest.skip(f"Database not available: {e}")
    yield conn
    conn.close()

@pytest.fixture(autouse=True)
def clean_db(db_connection):
    # Setup / cleanup before each test
    cur = db_connection.cursor()
    cur.execute("DELETE FROM refresh_tokens;")
    cur.execute("DELETE FROM users;")
    db_connection.commit()
    yield
    cur.execute("DELETE FROM refresh_tokens;")
    cur.execute("DELETE FROM users;")
    db_connection.commit()

def test_users_table_creation_and_defaults(db_connection):
    cur = db_connection.cursor()
    # Insert with minimum required fields
    cur.execute("""
        INSERT INTO users (email, hashed_password, full_name) 
        VALUES ('test@example.com', 'hashed123', 'Test User') 
        RETURNING id, role, is_active, created_at, updated_at;
    """)
    db_connection.commit()
    row = cur.fetchone()
    assert row is not None
    user_id, role, is_active, created_at, updated_at = row
    
    # Defaults should be applied
    assert role == 'PROCUREMENT_OFFICER'
    assert is_active is True
    assert created_at is not None
    assert updated_at is not None

def test_unique_email_constraint(db_connection):
    cur = db_connection.cursor()
    cur.execute("""
        INSERT INTO users (email, hashed_password, full_name) 
        VALUES ('unique@example.com', 'hash', 'User 1')
    """)
    db_connection.commit()
    
    with pytest.raises(psycopg2.errors.UniqueViolation):
        cur.execute("""
            INSERT INTO users (email, hashed_password, full_name) 
            VALUES ('unique@example.com', 'hash', 'User 2')
        """)
    db_connection.rollback()

def test_refresh_token_foreign_key_and_storage(db_connection):
    cur = db_connection.cursor()
    cur.execute("""
        INSERT INTO users (email, hashed_password, full_name) 
        VALUES ('token@example.com', 'hash', 'Token User') RETURNING id
    """)
    user_id = cur.fetchone()[0]
    db_connection.commit()
    
    # Insert valid token
    cur.execute("""
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES (%s, 'some_sha256_hash', CURRENT_TIMESTAMP + INTERVAL '7 days')
        RETURNING id
    """, (user_id,))
    db_connection.commit()
    token_id = cur.fetchone()[0]
    assert token_id is not None
    
    # Test ON DELETE CASCADE
    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    db_connection.commit()
    
    cur.execute("SELECT count(*) FROM refresh_tokens WHERE user_id = %s", (user_id,))
    count = cur.fetchone()[0]
    assert count == 0

def test_expiration_and_revocation_fields(db_connection):
    cur = db_connection.cursor()
    cur.execute("""
        INSERT INTO users (email, hashed_password, full_name) 
        VALUES ('fields@example.com', 'hash', 'Fields User') RETURNING id
    """)
    user_id = cur.fetchone()[0]
    
    # Insert token with revocation
    cur.execute("""
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked_at)
        VALUES (%s, 'hash2', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP)
        RETURNING revoked_at, expires_at
    """, (user_id,))
    db_connection.commit()
    
    row = cur.fetchone()
    assert row[0] is not None  # revoked_at is not null
    assert row[1] is not None  # expires_at is not null
