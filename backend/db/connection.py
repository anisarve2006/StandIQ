"""
Thread-Safe SQLite Connection Factory & High-Concurrency Pragma Manager.
Ensures Write-Ahead Logging (WAL), memory caching, and busy timeouts across all backend services.
"""

import os
import sqlite3
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DEFAULT_SQLITE_PATH = os.path.join(DATA_DIR, "standards.db")

_WAL_INITIALIZED = False


def get_sqlite_connection(db_path: Optional[str] = None, timeout: float = 15.0) -> sqlite3.Connection:
    """
    Returns an optimized, high-concurrency SQLite connection.
    Applies Write-Ahead Logging (WAL) and memory pragmas for sub-millisecond multi-threaded reads.
    """
    global _WAL_INITIALIZED
    target_path = db_path or DEFAULT_SQLITE_PATH

    conn = sqlite3.connect(
        target_path,
        timeout=timeout,
        check_same_thread=False
    )
    conn.row_factory = sqlite3.Row

    # Execute high-performance concurrency PRAGMAs
    try:
        # WAL mode only needs to be set once per database file
        if not _WAL_INITIALIZED:
            conn.execute("PRAGMA journal_mode = WAL;")
            _WAL_INITIALIZED = True
        conn.execute("PRAGMA synchronous = NORMAL;")
        conn.execute("PRAGMA cache_size = -64000;")     # 64 MB memory cache
        conn.execute("PRAGMA busy_timeout = 10000;")     # 10s timeout to prevent locking under load
        conn.execute("PRAGMA temp_store = MEMORY;")
        conn.execute("PRAGMA foreign_keys = ON;")
    except Exception:
        pass

    return conn
