# Confluent Cloud Setup Guide

This guide provides step-by-step instructions for deploying PulseRecover AI onto **Confluent Cloud** for the Laptop Challenge evaluation.

---

## Step 1: Environment & Cluster Creation

1. Log into [Confluent Cloud](https://confluent.cloud/home).
2. Create an Environment:
   - **Environment Name**: `pulse-recover-prod`
   - **Stream Governance**: Enable **Essentials** (or Advanced) for Schema Registry.
3. Create a Kafka Cluster:
   - **Cluster Name**: `pulse-recover-kafka`
   - **Cluster Type**: `Basic` (Free tier) or `Standard`
   - **Cloud Provider**: AWS or GCP (e.g. `us-east-1` or `us-central1`)
   - **Availability**: Single zone (demo) or Multi-zone

---

## Step 2: Enable Schema Registry & Create API Keys

1. In the Environment settings, verify **Schema Registry** is enabled. Note the **Endpoint URL**.
2. Under **API Keys**, generate:
   - **Kafka API Key & Secret** (Resource: Cluster `pulse-recover-kafka`)
   - **Schema Registry API Key & Secret** (Resource: Schema Registry)

---

## Step 3: Provision Kafka Topics

Use the Confluent CLI or UI to create the following 8 topics with 3 partitions each:
```bash
confluent kafka topic create customer-events --partitions 3
confluent kafka topic create payment-events --partitions 3
confluent kafka topic create support-events --partitions 3
confluent kafka topic create order-events --partitions 3
confluent kafka topic create delivery-events --partitions 3
confluent kafka topic create customer-risk --partitions 3
confluent kafka topic create recovery-actions --partitions 3
confluent kafka topic create system-anomalies --partitions 3
```

Alternatively, run our automated topic provisioning script:
```bash
bash infrastructure/confluent/create_topics.sh
```

---

## Step 4: Configure Confluent Connectors

### 1. PostgreSQL CDC Source V2 Connector
Streams customer support tickets and payment changes directly from PostgreSQL:
- Navigate to **Connectors** -> **Add Connector** -> **PostgreSQL CDC Source V2**.
- Upload configuration from `infrastructure/confluent/postgres_cdc_source_v2.json`.

### 2. HTTP Sink V2 Connector
Consumes recovery recommendations and posts webhooks to FastAPI:
- Navigate to **Connectors** -> **Add Connector** -> **HTTP Sink**.
- Upload configuration from `infrastructure/confluent/http_sink_v2.json`.
- Set `http.api.url` to your public recovery endpoint or local tunnel URL (e.g. `http://your-host:8000/api/recovery-actions`).

---

## Step 5: Deploy Flink SQL Statements

1. In Confluent Cloud, click **Flink** -> **Create Compute Pool** (`pulse-recover-compute-pool`).
2. Open **SQL Workspaces**.
3. Execute the SQL statements located in `flink/sql/`:
   - `01_sources.sql`: Register source tables.
   - `02_payment_failures.sql`: Tumbling window failure aggregations.
   - `03_support_sentiment.sql`: Streaming AI sentiment enrichment.
   - `04_system_anomalies.sql`: Anomaly detection queries.
   - `05_customer_risk_scoring.sql`: Real-time multi-signal risk calculation.
   - `06_recovery_actions_sink.sql`: Automatic recovery action emission.

---

## Step 6: Configure Local Environment

Copy `.env.example` to `.env` and fill in your Confluent Cloud values:
```bash
CONFLUENT_BOOTSTRAP_SERVER=pkc-xxxxx.us-east-1.aws.confluent.cloud:9092
CONFLUENT_KAFKA_API_KEY=YOUR_KEY
CONFLUENT_KAFKA_API_SECRET=YOUR_SECRET
CONFLUENT_SCHEMA_REGISTRY_URL=https://psrc-xxxxx.us-east-1.aws.confluent.cloud
CONFLUENT_SCHEMA_REGISTRY_API_KEY=YOUR_SR_KEY
CONFLUENT_SCHEMA_REGISTRY_API_SECRET=YOUR_SR_SECRET
```
