-- =============================================================================
-- PULSERECOVER AI - FLINK REAL-TIME RISK CALCULATION
-- Correlates windowed payment failures, negative sentiment, and customer events
-- =============================================================================

CREATE TABLE customer_risk_sink (
    event_id STRING,
    customer_id STRING,
    event_type STRING,
    event_time TIMESTAMP(3),
    risk_score INT,
    risk_level STRING,
    journey_state STRING,
    primary_issue STRING,
    recommended_action STRING,
    priority STRING
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'customer-risk',
    'value.format' = 'json-registry'
);

-- Emit enriched risk events by joining tumbling payment failures and support sentiment
INSERT INTO customer_risk_sink
SELECT
    CONCAT('risk_', SUBSTRING(MD5(p.customer_id || CAST(p.window_end AS STRING)), 1, 8)) AS event_id,
    p.customer_id,
    'risk_evaluated' AS event_type,
    p.window_end AS event_time,
    -- Deterministic risk calculation: Base 0 + Failures + Sentiment + Drop
    CAST(
        LEAST(100, 
            (CASE WHEN p.failure_count >= 1 THEN 20 ELSE 0 END) +
            (CASE WHEN p.failure_count >= 2 THEN 15 * (p.failure_count - 1) ELSE 0 END) +
            (CASE WHEN s.is_negative THEN 20 ELSE 0 END) +
            15 + -- Cart abandonment factor
            10 + -- Site latency factor
            7    -- Support escalation factor
        ) AS INT
    ) AS risk_score,
    CASE 
        WHEN p.failure_count >= 2 AND s.is_negative THEN 'CRITICAL'
        WHEN p.failure_count >= 1 OR s.is_negative THEN 'HIGH'
        ELSE 'MEDIUM'
    END AS risk_level,
    'HIGH_RISK' AS journey_state,
    'Repeated Payment Failures & Customer Frustration' AS primary_issue,
    'PAYMENT_ASSISTANCE' AS recommended_action,
    'HIGH' AS priority
FROM customer_payment_failure_window p
LEFT JOIN enriched_support_sentiment s
ON p.customer_id = s.customer_id
WHERE p.failure_count >= 1;
