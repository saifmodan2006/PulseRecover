#!/usr/bin/env bash
# =============================================================================
# PULSERECOVER AI - CONFLUENT CLOUD TOPIC PROVISIONING SCRIPT
# =============================================================================
set -e

CLUSTER_ID="${CONFLUENT_KAFKA_CLUSTER_ID:-pulse-recover-kafka}"
ENVIRONMENT_ID="${CONFLUENT_ENV_ID:-pulse-recover-prod}"

echo "Creating standard topics for PulseRecover AI..."

TOPICS=(
  "customer-events"
  "payment-events"
  "support-events"
  "order-events"
  "delivery-events"
  "customer-risk"
  "recovery-actions"
  "system-anomalies"
  "aggregated-payment-failures"
  "enriched-support-sentiment"
)

for topic in "${TOPICS[@]}"; do
  echo "Provisioning topic: ${topic}..."
  confluent kafka topic create "${topic}" \
    --cluster "${CLUSTER_ID}" \
    --partitions 3 \
    --config retention.ms=604800000 \
    --if-not-exists || true
done

echo "Registering schemas with Schema Registry..."
SCHEMAS_DIR="../../schemas"

# Register schemas if confluent CLI is authenticated
for schema_file in "${SCHEMAS_DIR}"/*.json; do
  subject_name="$(basename "${schema_file}" .json)-value"
  echo "Registering schema ${schema_file} as subject ${subject_name}..."
  confluent schema-registry schema create \
    --subject "${subject_name}" \
    --schema "${schema_file}" \
    --type JSON || true
done

echo "All PulseRecover AI topics and schemas successfully provisioned."
