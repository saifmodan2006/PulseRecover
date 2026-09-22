-- =============================================================================
-- PULSERECOVER AI - POSTGRESQL INITIALIZATION & LOGICAL REPLICATION SETUP
-- Enables WAL Level logical for Confluent PostgreSQL CDC Source V2 Connector
-- =============================================================================

-- Ensure WAL level is logical for CDC
-- In postgresql.conf: wal_level = logical

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    current_journey VARCHAR(64) NOT NULL DEFAULT 'Checkout',
    journey_state VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    risk_score INT NOT NULL DEFAULT 0,
    primary_issue VARCHAR(255) NOT NULL DEFAULT 'None',
    sentiment VARCHAR(32) NOT NULL DEFAULT 'neutral',
    sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    potential_value DOUBLE PRECISION NOT NULL DEFAULT 14990.0,
    status VARCHAR(32) NOT NULL DEFAULT 'Normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_events (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(64),
    source VARCHAR(64) DEFAULT 'web-storefront',
    payload_json TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(32) NOT NULL DEFAULT 'card',
    failure_reason VARCHAR(255),
    retry_count INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    ticket_id VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(32) NOT NULL DEFAULT 'chat',
    sentiment VARCHAR(32) NOT NULL DEFAULT 'neutral',
    sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    order_id VARCHAR(64) NOT NULL,
    carrier VARCHAR(64) NOT NULL DEFAULT 'BlueDart',
    delay_minutes INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'in_transit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery_actions (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    action_type VARCHAR(64) NOT NULL,
    trigger_event VARCHAR(128) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    reasons_json TEXT NOT NULL DEFAULT '[]',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    result_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    affected_customers INT NOT NULL DEFAULT 0,
    failure_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    baseline_rate DOUBLE PRECISION NOT NULL DEFAULT 2.1,
    status VARCHAR(32) NOT NULL DEFAULT 'INVESTIGATING',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    details TEXT
);

CREATE TABLE IF NOT EXISTS customer_risk_snapshots (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    risk_score INT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    journey_state VARCHAR(32) NOT NULL,
    factors_json TEXT NOT NULL DEFAULT '[]',
    primary_issue VARCHAR(255) NOT NULL DEFAULT 'None',
    recommendation VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_anomalies (
    id VARCHAR(64) PRIMARY KEY,
    anomaly_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    metric_name VARCHAR(64) NOT NULL,
    current_value DOUBLE PRECISION NOT NULL,
    baseline_value DOUBLE PRECISION NOT NULL,
    details TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Publication for Confluent CDC
CREATE PUBLICATION pulsercover_cdc_pub FOR TABLE support_tickets, payments;
