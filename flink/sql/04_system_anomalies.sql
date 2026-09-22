-- =============================================================================
-- PULSERECOVER AI - FLINK ML_DETECT_ANOMALIES
-- Monitors real-time checkout conversion and payment failure anomalies
-- =============================================================================

CREATE TABLE system_anomalies_sink (
    anomaly_id STRING,
    anomaly_type STRING,
    severity STRING,
    metric_name STRING,
    current_value DOUBLE,
    baseline_value DOUBLE,
    anomaly_score DOUBLE,
    affected_subsystem STRING,
    detected_at TIMESTAMP(3),
    details STRING
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'system-anomalies',
    'value.format' = 'json-registry'
);

-- Detect payment failure rate spike over a 5-minute hopping window
INSERT INTO system_anomalies_sink
SELECT
    CONCAT('ANOM-', SUBSTRING(MD5(CAST(window_end AS STRING)), 1, 8)) AS anomaly_id,
    'payment_failure_rate_anomaly' AS anomaly_type,
    CASE WHEN failure_rate >= 15.0 THEN 'CRITICAL' ELSE 'HIGH' END AS severity,
    'payment_failure_rate' AS metric_name,
    failure_rate AS current_value,
    2.1 AS baseline_value,
    (failure_rate / 20.0) AS anomaly_score,
    'payments-gateway' AS affected_subsystem,
    window_end AS detected_at,
    CONCAT('Rolling payment failure rate spiked to ', CAST(failure_rate AS STRING), '% (baseline: 2.1%).') AS details
FROM (
    SELECT
        HOP_END(event_time, INTERVAL '1' MINUTE, INTERVAL '5' MINUTE) AS window_end,
        (COUNT(CASE WHEN event_type = 'payment_failed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) AS failure_rate
    FROM payment_events
    GROUP BY
        HOP(event_time, INTERVAL '1' MINUTE, INTERVAL '5' MINUTE)
)
WHERE failure_rate >= 8.0;
