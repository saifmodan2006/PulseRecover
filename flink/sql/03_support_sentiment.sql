-- =============================================================================
-- PULSERECOVER AI - FLINK AI_SENTIMENT ENRICHMENT
-- Uses Confluent Cloud Flink AI_SENTIMENT built-in model to extract customer sentiment
-- =============================================================================

CREATE TABLE enriched_support_sentiment (
    event_id STRING,
    customer_id STRING,
    ticket_id STRING,
    message STRING,
    sentiment_label STRING,
    sentiment_score DOUBLE,
    is_negative BOOLEAN,
    event_time TIMESTAMP(3)
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'enriched-support-sentiment',
    'value.format' = 'json-registry'
);

INSERT INTO enriched_support_sentiment
SELECT
    event_id,
    customer_id,
    ticket_id,
    message,
    AI_SENTIMENT(message) AS sentiment_label,
    CASE 
        WHEN AI_SENTIMENT(message) = 'negative' THEN -0.85
        WHEN AI_SENTIMENT(message) = 'positive' THEN 0.80
        ELSE 0.0
    END AS sentiment_score,
    CASE WHEN AI_SENTIMENT(message) = 'negative' THEN TRUE ELSE FALSE END AS is_negative,
    event_time
FROM support_events
WHERE event_type = 'support_message';
