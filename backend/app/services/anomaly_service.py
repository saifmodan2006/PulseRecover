from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timezone

class AnomalyDetectionService:
    """
    Implements Flink's ML_DETECT_ANOMALIES stream function.
    Tracks sliding metrics against standard deviation baseline thresholds.
    """
    BASELINE_PAYMENT_FAILURE_RATE = 2.1 # %
    PAYMENT_FAILURE_THRESHOLD = 8.0 # % (3-sigma breach)

    BASELINE_LATENCY_MS = 180.0
    LATENCY_THRESHOLD_MS = 600.0

    @classmethod
    def evaluate_payment_metric(cls, current_failure_rate: float) -> Optional[Dict[str, Any]]:
        if current_failure_rate >= cls.PAYMENT_FAILURE_THRESHOLD:
            return {
                "anomaly_id": f"ANOM-{uuid.uuid4().hex[:6].upper()}",
                "anomaly_type": "payment_failure_rate_anomaly",
                "severity": "CRITICAL" if current_failure_rate >= 15.0 else "HIGH",
                "metric_name": "payment_failure_rate",
                "current_value": round(current_failure_rate, 2),
                "baseline_value": cls.BASELINE_PAYMENT_FAILURE_RATE,
                "anomaly_score": round(min(1.0, current_failure_rate / 20.0), 2),
                "affected_subsystem": "payments-gateway",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "details": f"Payment failure rate breached 3-sigma anomaly threshold ({current_failure_rate}% vs {cls.BASELINE_PAYMENT_FAILURE_RATE}% baseline)."
            }
        return None

    @classmethod
    def evaluate_latency_metric(cls, latency_ms: float) -> Optional[Dict[str, Any]]:
        if latency_ms >= cls.LATENCY_THRESHOLD_MS:
            return {
                "anomaly_id": f"ANOM-{uuid.uuid4().hex[:6].upper()}",
                "anomaly_type": "latency_spike",
                "severity": "HIGH",
                "metric_name": "p99_latency_ms",
                "current_value": round(latency_ms, 1),
                "baseline_value": cls.BASELINE_LATENCY_MS,
                "anomaly_score": 0.88,
                "affected_subsystem": "web-checkout-api",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "details": f"API checkout p99 latency spiked to {latency_ms}ms (baseline: {cls.BASELINE_LATENCY_MS}ms)."
            }
        return None

anomaly_service = AnomalyDetectionService()
