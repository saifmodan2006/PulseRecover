# PulseRecover AI - Distributed Streaming Architecture

## 1. Executive Overview

**PulseRecover AI** is a real-time customer experience intelligence and revenue protection platform built on the **Confluent Cloud** data streaming backbone. It detects customer friction—such as payment retry storms, gateway timeouts, cart abandonment, and customer dissatisfaction—before it manifests as permanent customer loss or revenue churn.

The platform continuously processes distributed signals across e-commerce, payment gateways, logistics, and customer support, computes transparent explainable risk scores inside **Confluent Cloud for Apache Flink**, and triggers targeted automated recovery workflows via **Confluent Connectors** and **FastAPI**.

---

## 2. Core Architecture Pipeline

```text
Event Sources (Web/Mobile/Gateways/APM)
              │
              ▼
   Confluent Cloud Apache Kafka
  (8 partitioned topics + Schema Registry)
              │
              ├── customer-events
              ├── payment-events
              ├── support-events (via Postgres CDC Source V2)
              ├── order-events
              ├── delivery-events
              │
              ▼
 Confluent Cloud for Apache Flink
  ├── Sliding & Tumbling Windows (10m)
  ├── Multi-stream Temporal Joins
  ├── AI_SENTIMENT Model Enrichment
  ├── ML_DETECT_ANOMALIES (3-sigma)
  └── Deterministic Risk Scoring (0-100)
              │
              ▼
   Kafka: recovery-actions Topic
              │
              ▼
  Confluent HTTP Sink V2 Connector
              │
              ▼
   FastAPI Recovery Core Service
  ├── Allow-list Action Verification
  ├── Idempotency Guard (Deduplication)
  ├── State Recovery (RECOVERED)
  └── WebSocket Live Stream Broadcast
              │
              ▼
 PulseRecover Enterprise Dashboard (Next.js)
```

---

## 3. Kafka Topics & Schemas

| Topic Name | Key Format | Value Format | Retention | Partitions | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `customer-events` | `customer_id` (String) | `JSON_SR` (customer_event.json) | 7 Days | 3 | Page views, product views, cart additions, checkout drop-offs. |
| `payment-events` | `customer_id` (String) | `JSON_SR` (payment_event.json) | 7 Days | 3 | Payment authorizations, failures, retries, and gateway telemetry. |
| `support-events` | `customer_id` (String) | `JSON_SR` (support_event.json) | 7 Days | 3 | Inbound chat messages and tickets captured via PostgreSQL CDC. |
| `order-events` | `customer_id` (String) | `JSON_SR` (order_event.json) | 7 Days | 3 | Order placement, cancellations, and order amounts. |
| `delivery-events` | `customer_id` (String) | `JSON_SR` (delivery_event.json) | 7 Days | 3 | Carrier transit updates and shipping delay telemetry. |
| `customer-risk` | `customer_id` (String) | `JSON_SR` (customer_risk.json) | 7 Days | 3 | Real-time risk evaluations, factor points, and recommendations. |
| `recovery-actions` | `customer_id` (String) | `JSON_SR` (recovery_action.json) | 7 Days | 3 | Automated recovery interventions dispatched to HTTP Sink. |
| `system-anomalies` | `anomaly_id` (String) | `JSON_SR` (system_anomaly.json) | 7 Days | 3 | ML-detected system anomalies and failure rate spikes. |

---

## 4. Confluent Flink Stream Processing & AI/ML

1. **Sliding & Tumbling Windows**:
   - `TUMBLE(event_time, INTERVAL '10' MINUTE)` aggregates payment failures per customer to detect retry loops.
   - `HOP(event_time, INTERVAL '1' MINUTE, INTERVAL '5' MINUTE)` monitors global payment failure rates.
2. **AI_SENTIMENT Function**:
   - Executes semantic sentiment inference on customer support messages, emitting `negative`, `neutral`, or `positive` classifications with confidence scores.
3. **ML_DETECT_ANOMALIES**:
   - Flags 3-sigma spikes in checkout drop-offs and payment gateway failure rates against historical rolling baselines.
4. **Temporal Joins**:
   - Joins windowed payment failures with enriched negative sentiment messages on `customer_id` within a 15-minute validity window.

---

## 5. Automated Recovery & Idempotency Safeguards

Automated recovery cannot rely on unconstrained AI output. PulseRecover AI implements a **strict action allow-list**:
- `PAYMENT_ASSISTANCE`: Alternative UPI link, cart item reservation, fee waiver.
- `PRIORITY_SUPPORT`: Automatic VIP CSR routing in support queue.
- `DISCOUNT_OFFER`: Instant 15% concession coupon code (`RECOVER15`).
- `ALTERNATIVE_PAYMENT`: Fallback checkout tender method switch.
- `DELIVERY_ESCALATION`: Express Air shipping priority upgrade.
- `CUSTOMER_NOTIFICATION`: Proactive latency apology push notification.

**Idempotency Key Enforcement**:
Every recovery action is tagged with an idempotency key (e.g. `rec_C1029_PAYMENT_ASSISTANCE_20260922`). Duplicate webhook deliveries from HTTP Sink V2 are acknowledged without re-executing communications or discounts.
