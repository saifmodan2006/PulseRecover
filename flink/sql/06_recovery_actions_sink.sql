-- =============================================================================
-- PULSERECOVER AI - FLINK AUTOMATED RECOVERY ACTION GENERATION
-- Emits structured, validated recovery actions for critical at-risk journeys
-- =============================================================================

CREATE TABLE recovery_actions_sink (
    action_id STRING,
    customer_id STRING,
    action_type STRING,
    trigger_event STRING,
    priority STRING,
    idempotency_key STRING,
    status STRING,
    created_at TIMESTAMP(3)
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'recovery-actions',
    'value.format' = 'json-registry'
);

-- Emit automatic recovery actions when risk exceeds CRITICAL threshold (score >= 80)
INSERT INTO recovery_actions_sink
SELECT
    CONCAT('ACT-', SUBSTRING(MD5(customer_id || CAST(event_time AS STRING)), 1, 8)) AS action_id,
    customer_id,
    recommended_action AS action_type,
    'flink_critical_risk_breach' AS trigger_event,
    priority,
    CONCAT('rec_', customer_id, '_', recommended_action, '_', CAST(CAST(event_time AS DATE) AS STRING)) AS idempotency_key,
    'PENDING' AS status,
    event_time AS created_at
FROM customer_risk_sink
WHERE risk_score >= 80;
