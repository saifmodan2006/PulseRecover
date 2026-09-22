export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  current_journey: string;
  journey_state: "NORMAL" | "AT_RISK" | "HIGH_RISK" | "RECOVERING" | "RECOVERED" | "LOST";
  risk_score: number;
  primary_issue: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  potential_value: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface StreamEvent {
  time: string;
  topic: string;
  key: string;
  event_type: string;
  customer_id: string;
  source: string;
  status: string;
  payload: any;
}

export interface RiskFactor {
  signal: string;
  points: number;
  description: string;
}

export interface RecoveryAction {
  id: string;
  action_id: string;
  customer_id: string;
  action_type: string;
  trigger: string;
  priority: string;
  idempotency_key: string;
  reason: string[];
  status: "PENDING" | "TRIGGERED" | "SUCCESS" | "FAILED";
  result?: string;
  time?: string;
  executed_at?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  affected_customers: number;
  failure_rate: number;
  baseline_rate: number;
  status: "INVESTIGATING" | "MITIGATING" | "RESOLVED";
  started_at: string;
  details?: string;
}

export interface BusinessKPIs {
  at_risk_customers: number;
  critical_risk_customers: number;
  recovered_customers: number;
  recovery_rate: number;
  estimated_revenue_at_risk: number;
  estimated_revenue_recovered: number;
  average_mttd_seconds: number;
  average_mttr_seconds: number;
  payment_failure_rate: number;
  active_incidents_count: number;
  is_simulated: boolean;
  simulation_label: string;
}

export interface IntegrationItem {
  name: string;
  status: string;
  type: string;
  cluster?: string;
  environment?: string;
  topics_count?: number;
  messages_processed?: number;
  format?: string;
  schemas_registered?: number;
  active_jobs?: string[];
  windowing?: string;
  source_table?: string;
  target_topic?: string;
  source_topic?: string;
  target_endpoint?: string;
  tables_count?: number;
  models?: string[];
}
