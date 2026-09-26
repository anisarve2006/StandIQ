"""
Resilient Circuit Breaker Service for Sovereign AI & External Services.
System Design Pattern: Circuit Breaker with Graceful Degradation.
Protects application latency SLAs from neural model timeouts or CPU starvation.
"""

import time
from enum import Enum
from threading import RLock
from typing import Callable, Any, Optional, Dict
from loguru import logger


class CircuitState(str, Enum):
    CLOSED = "CLOSED"       # Normal operation; calls pass through
    OPEN = "OPEN"           # Tripped; calls immediately route to fallback
    HALF_OPEN = "HALF_OPEN" # Testing recovery; single trial call allowed


class CircuitBreaker:
    """
    Standard 3-State Circuit Breaker.
    - If failures exceed failure_threshold within the window, trips to OPEN.
    - Stays OPEN for recovery_timeout_seconds, protecting CPU/RAM.
    - Transitions to HALF_OPEN to trial a request; if successful, resets to CLOSED.
    """
    def __init__(
        self,
        name: str = "LLM-Inference",
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 30.0,
        execution_timeout_seconds: float = 4.0
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout_seconds
        self.execution_timeout = execution_timeout_seconds

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_state_change = time.time()
        self.last_failure_time = 0.0
        self._lock = RLock()

    def call(self, func: Callable, *args, fallback: Optional[Callable] = None, **kwargs) -> Any:
        """
        Executes func protected by the circuit breaker.
        If OPEN, immediately calls fallback or raises exception.
        """
        now = time.time()

        with self._lock:
            # Check for transition from OPEN -> HALF_OPEN
            if self.state == CircuitState.OPEN:
                if now - self.last_failure_time >= self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.last_state_change = now
                    logger.info(f"[CircuitBreaker:{self.name}] Transitioned OPEN -> HALF_OPEN. Trialing service.")
                else:
                    if fallback is not None:
                        return fallback(*args, **kwargs)
                    raise RuntimeError(f"CircuitBreaker '{self.name}' is OPEN. Request rejected.")

        # Attempt invocation
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure(e)
            if fallback is not None:
                return fallback(*args, **kwargs)
            raise e

    def _on_success(self):
        with self._lock:
            self.failure_count = 0
            self.success_count += 1
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
                self.last_state_change = time.time()
                logger.info(f"[CircuitBreaker:{self.name}] Service recovered. State reset to CLOSED.")

    def _on_failure(self, error: Exception):
        now = time.time()
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = now
            logger.warning(f"[CircuitBreaker:{self.name}] Call failed ({self.failure_count}/{self.failure_threshold}): {error}")

            if self.failure_count >= self.failure_threshold or self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.OPEN
                self.last_state_change = now
                logger.error(f"[CircuitBreaker:{self.name}] Threshold exceeded! Circuit tripped to OPEN for {self.recovery_timeout}s.")

    def get_status(self) -> Dict[str, Any]:
        """Telemetry status of the circuit breaker."""
        with self._lock:
            return {
                "name": self.name,
                "state": self.state.value,
                "failure_count": self.failure_count,
                "success_count": self.success_count,
                "last_failure_time": self.last_failure_time,
                "time_in_current_state_s": round(time.time() - self.last_state_change, 1)
            }


# Global Circuit Breaker for Local Sovereign LLM
bharatgpt_circuit_breaker = CircuitBreaker(
    name="BharatGPT-3B-Sovereign",
    failure_threshold=3,
    recovery_timeout_seconds=20.0,
    execution_timeout_seconds=3.0
)
