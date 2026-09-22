# Confluent Cloud for Apache Flink - Stream Processing Engine

## Overview

PulseRecover AI uses **Confluent Cloud for Apache Flink** to eliminate traditional batch ETL and detect customer friction in real time using streaming SQL.

---

## 1. Windowing & Aggregations

### Customer Payment Failure Window (10-minute Tumbling)
```sql
SELECT
    customer_id,
    TUMBLE_START(event_time, INTERVAL '10' MINUTE) AS window_start,
    TUMBLE_END(event_time, INTERVAL '10' MINUTE) AS window_end,
    COUNT(CASE WHEN event_type = 'payment_failed' THEN 1 END) AS failure_count,
    COUNT(CASE WHEN event_type = 'payment_retry' THEN 1 END) AS retry_count
FROM payment_events
GROUP BY
    customer_id,
    TUMBLE(event_time, INTERVAL '10' MINUTE);
```
- **Business Rationale**: Single payment failures happen normally due to bank network timeouts. Repeated payment failures within 10 minutes signal severe customer friction and imminent cart abandonment.

---

## 2. In-Stream AI/ML Functions

### AI_SENTIMENT Model Inference
```sql
SELECT
    customer_id,
    message,
    AI_SENTIMENT(message) AS sentiment_label
FROM support_events
WHERE event_type = 'support_message';
```
- **Value**: Instead of waiting for post-interaction surveys, Flink extracts polarity directly from incoming chat messages in real time.

### ML_DETECT_ANOMALIES Monitoring
```sql
SELECT
    window_end,
    failure_rate
FROM (
    SELECT
        HOP_END(event_time, INTERVAL '1' MINUTE, INTERVAL '5' MINUTE) AS window_end,
        (COUNT(CASE WHEN event_type = 'payment_failed' THEN 1 END) * 100.0 / COUNT(*)) AS failure_rate
    FROM payment_events
    GROUP BY HOP(event_time, INTERVAL '1' MINUTE, INTERVAL '5' MINUTE)
)
WHERE failure_rate >= 8.0;
```
- **Value**: Discovers system-wide payment gateway outages affecting hundreds of concurrent shoppers before SRE alarms trigger.

---

## 3. Explainable Risk Join & Action Emission

Flink joins windowed payment failures with customer sentiment and session activity to compute explainable customer risk scores:
- **0–29**: LOW
- **30–59**: MEDIUM
- **60–79**: HIGH
- **80–100**: CRITICAL

When risk exceeds 80, Flink automatically emits structured recovery recommendations (`PAYMENT_ASSISTANCE`, `PRIORITY_SUPPORT`, etc.) to the `recovery-actions` topic.
