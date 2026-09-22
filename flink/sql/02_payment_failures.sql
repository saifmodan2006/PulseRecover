-- =============================================================================
-- PULSERECOVER AI - FLINK SQL PAYMENT FAILURE AGGREGATIONS
-- Aggregates failure counts over a 10-minute tumbling window per customer
-- =============================================================================

CREATE TABLE customer_payment_failure_window (
    customer_id STRING,
    window_start TIMESTAMP(3),
    window_end TIMESTAMP(3),
    failure_count BIGINT,
    retry_count BIGINT,
    total_failed_amount DOUBLE,
    PRIMARY KEY (customer_id, window_end) NOT ENFORCED
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'aggregated-payment-failures',
    'value.format' = 'json-registry'
);

INSERT INTO customer_payment_failure_window
SELECT
    customer_id,
    TUMBLE_START(event_time, INTERVAL '10' MINUTE) AS window_start,
    TUMBLE_END(event_time, INTERVAL '10' MINUTE) AS window_end,
    COUNT(CASE WHEN event_type = 'payment_failed' THEN 1 END) AS failure_count,
    COUNT(CASE WHEN event_type = 'payment_retry' THEN 1 END) AS retry_count,
    SUM(CASE WHEN event_type = 'payment_failed' THEN amount ELSE 0.0 END) AS total_failed_amount
FROM payment_events
GROUP BY
    customer_id,
    TUMBLE(event_time, INTERVAL '10' MINUTE);
