-- =============================================================================
-- PULSERECOVER AI - FLINK SQL SOURCE DECLARATIONS
-- Environment: pulse-recover-prod | Cluster: pulse-recover-kafka
-- =============================================================================

-- 1. Customer Interaction Events Table
CREATE TABLE customer_events (
    event_id STRING,
    customer_id STRING,
    event_type STRING,
    event_time TIMESTAMP(3),
    session_id STRING,
    source STRING,
    metadata STRING,
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'customer-events',
    'value.format' = 'json-registry'
);

-- 2. Payment Events Table
CREATE TABLE payment_events (
    event_id STRING,
    customer_id STRING,
    event_type STRING,
    event_time TIMESTAMP(3),
    session_id STRING,
    amount DOUBLE,
    currency STRING,
    payment_method STRING,
    failure_reason STRING,
    retry_count INT,
    source STRING,
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'payment-events',
    'value.format' = 'json-registry'
);

-- 3. Support Messages & Tickets Table
CREATE TABLE support_events (
    event_id STRING,
    customer_id STRING,
    event_type STRING,
    event_time TIMESTAMP(3),
    session_id STRING,
    ticket_id STRING,
    message STRING,
    channel STRING,
    urgency STRING,
    source STRING,
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'support-events',
    'value.format' = 'json-registry'
);

-- 4. Order Lifecycle Table
CREATE TABLE order_events (
    event_id STRING,
    customer_id STRING,
    event_type STRING,
    event_time TIMESTAMP(3),
    order_id STRING,
    total_amount DOUBLE,
    items_count INT,
    status STRING,
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'order-events',
    'value.format' = 'json-registry'
);

-- 5. Delivery Telemetry Table
CREATE TABLE delivery_events (
    event_id STRING,
    customer_id STRING,
    event_type STRING,
    event_time TIMESTAMP(3),
    order_id STRING,
    carrier STRING,
    delay_minutes INT,
    reason STRING,
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'confluent',
    'kafka.topic' = 'delivery-events',
    'value.format' = 'json-registry'
);
