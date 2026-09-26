"""
High-Performance In-Memory Multi-Tier Query Cache Service with TTL & LRU Eviction.
System Design Pattern: Memoization & Cache-Aside with Invalidation Hooks.
"""

import time
import hashlib
from collections import OrderedDict
from threading import RLock
from typing import Any, Optional, Dict, Tuple
from loguru import logger


class QueryLRUCache:
    """
    Thread-safe Least Recently Used (LRU) Cache with Time-to-Live (TTL).
    Designed to serve repeated procurement and tender queries in <1ms.
    """
    def __init__(self, max_size: int = 2048, default_ttl_seconds: int = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl_seconds
        self._cache: OrderedDict[str, Tuple[Any, float]] = OrderedDict()
        self._lock = RLock()
        
        # Telemetry metrics
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    @staticmethod
    def _normalize_key(query: str, options: Optional[Dict[str, Any]] = None) -> str:
        """Generates deterministic sha256 hash from normalized query string and parameters."""
        norm_q = " ".join(query.strip().lower().split())
        opts_str = ""
        if options:
            opts_str = ":" + str(sorted(options.items()))
        full_key = f"{norm_q}{opts_str}"
        return hashlib.sha256(full_key.encode("utf-8")).hexdigest()

    def get(self, query: str, options: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        """Retrieves cached item if present and not expired."""
        key = self._normalize_key(query, options)
        with self._lock:
            if key not in self._cache:
                self.misses += 1
                return None

            value, expiry = self._cache[key]
            now = time.time()

            if now > expiry:
                # Expired item: evict immediately
                del self._cache[key]
                self.misses += 1
                return None

            # Move to end to denote most recently used
            self._cache.move_to_end(key)
            self.hits += 1
            return value

    def put(self, query: str, value: Any, options: Optional[Dict[str, Any]] = None, ttl_seconds: Optional[int] = None) -> None:
        """Stores item in cache, evicting oldest item if capacity is exceeded."""
        key = self._normalize_key(query, options)
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expiry = time.time() + ttl

        with self._lock:
            if key in self._cache:
                self._cache[key] = (value, expiry)
                self._cache.move_to_end(key)
                return

            if len(self._cache) >= self.max_size:
                # Evict oldest item (FIFO from front)
                self._cache.popitem(last=False)
                self.evictions += 1

            self._cache[key] = (value, expiry)

    def invalidate(self, query: Optional[str] = None) -> None:
        """Invalidates a single query or clears the entire cache if query is None."""
        with self._lock:
            if query is None:
                self._cache.clear()
                logger.info("[CacheService] Entire query cache invalidated.")
            else:
                key = self._normalize_key(query)
                if key in self._cache:
                    del self._cache[key]
                    logger.info(f"[CacheService] Invalidated cache key for: '{query}'")

    def get_stats(self) -> Dict[str, Any]:
        """Returns cache telemetry stats for observability and SRE monitoring."""
        with self._lock:
            total = self.hits + self.misses
            hit_ratio = round((self.hits / total) * 100, 2) if total > 0 else 0.0
            return {
                "size": len(self._cache),
                "max_size": self.max_size,
                "hits": self.hits,
                "misses": self.misses,
                "evictions": self.evictions,
                "hit_ratio_percent": hit_ratio
            }


# Global Query Cache Singleton
query_cache = QueryLRUCache(max_size=4096, default_ttl_seconds=7200)
