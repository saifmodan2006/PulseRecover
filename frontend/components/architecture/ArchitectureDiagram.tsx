"use client";

import { useState } from "react";
import { Database, HardDrive, Cpu, Brain, ShieldAlert, Zap, Send, Layout, ChevronRight, Layers } from "lucide-react";

interface NodeData {
  id: string;
  name: string;
  category: string;
  tech: string;
  description: string;
  details: {
    specs: string[];
    sample?: any;
    confluentRole: string;
  };
}

const NODES: NodeData[] = [
  {
    id: "sources",
    name: "Customer Interaction Sources",
    category: "Data Ingestion",
    tech: "Storefront, Mobile App, Payment Gateway, Logistics",
    description: "Multi-channel event emitters tracking clicks, checkouts, gateway responses, and chat transcripts.",
    details: {
      specs: [
        "ISO 8601 UTC event timestamps",
        "Uniform envelope: event_id, customer_id, session_id, source",
        "Sub-second event generation frequency"
      ],
      sample: {
        "event_id": "evt_9a8f2",
        "customer_id": "C1029",
        "event_type": "checkout_started",
        "source": "web-storefront"
      },
      confluentRole: "Continuous source inputs for Kafka streaming ingestion."
    }
  },
  {
    id: "postgres",
    name: "System of Record (PostgreSQL)",
    category: "Persistence",
    tech: "PostgreSQL 16+ (WAL level = logical)",
    description: "Transactional database holding customer accounts, support tickets, and transaction receipts.",
    details: {
      specs: [
        "Tables: customers, payments, support_tickets, recovery_actions",
        "Logical replication slot enabled for CDC",
        "Strict foreign key consistency"
      ],
      confluentRole: "Source database captured by Confluent PostgreSQL CDC Source V2 Connector."
    }
  },
  {
    id: "cdc",
    name: "Confluent PostgreSQL CDC Source V2",
    category: "Change Data Capture",
    tech: "Confluent Cloud Connect",
    description: "Captures row-level database changes in real time and streams them to Kafka topics without polling.",
    details: {
      specs: [
        "Connector class: io.confluent.connect.jdbc.PostgresCdcSourceV2",
        "Output format: JSON_SR with Schema Registry validation",
        "Dead-letter queue enabled (cdc-dlq)",
        "Zero performance impact on primary OLTP transactions"
      ],
      confluentRole: "Continuous streaming bridge from database to Confluent Cloud Kafka."
    }
  },
  {
    id: "kafka",
    name: "Confluent Cloud Apache Kafka",
    category: "Streaming Backbone",
    tech: "Cluster: pulse-recover-kafka (3 Partitions)",
    description: "Central distributed commit log storing high-throughput, partitioned, ordered events across 8 core topics.",
    details: {
      specs: [
        "Topics: customer-events, payment-events, support-events, order-events, delivery-events, customer-risk, recovery-actions, system-anomalies",
        "Retention: 7 days with TLS SASL_SSL authentication",
        "Confluent Schema Registry integration for JSON Schema evolution"
      ],
      confluentRole: "The central nervous system of the entire real-time recovery platform."
    }
  },
  {
    id: "flink",
    name: "Confluent Cloud for Apache Flink",
    category: "Stream Processing",
    tech: "Flink SQL Engine (Serverless Compute Pool)",
    description: "Executes continuous sliding and tumbling window aggregations, multi-stream temporal joins, and state correlation.",
    details: {
      specs: [
        "TUMBLE(event_time, INTERVAL '10' MINUTE) windowing",
        "Stateful temporal joins between payment retries and support chats",
        "Sub-second event-time stream processing latency"
      ],
      sample: "SELECT customer_id, COUNT(*) FROM payment_events GROUP BY customer_id, TUMBLE(event_time, INTERVAL '10' MINUTE)",
      confluentRole: "Computes customer friction states and risk in real time directly inside the streaming layer."
    }
  },
  {
    id: "ai",
    name: "Streaming AI/ML Models",
    category: "Intelligence",
    tech: "AI_SENTIMENT & ML_DETECT_ANOMALIES",
    description: "In-stream natural language sentiment inference and 3-sigma statistical anomaly detection.",
    details: {
      specs: [
        "AI_SENTIMENT(message) extracts customer friction & polarity",
        "ML_DETECT_ANOMALIES flags payment gateway spikes (>8.0% vs 2.1% baseline)",
        "Structured outputs feed directly into downstream decision rules"
      ],
      confluentRole: "Enriches raw events with contextual AI insights without brittle batch ETL pipelines."
    }
  },
  {
    id: "risk",
    name: "Explainable Risk Engine",
    category: "Decisioning",
    tech: "Deterministic Factor Scoring",
    description: "Evaluates multi-signal friction weights to calculate transparent customer risk scores (0-100).",
    details: {
      specs: [
        "Payment failures: +20 | Retries: +15 | Negative sentiment: +20",
        "Cart abandonment: +15 | Latency spike: +10 | Support escalation: +7",
        "Risk tiers: Low (0-29), Medium (30-59), High (60-79), Critical (80-100)"
      ],
      confluentRole: "Translates streaming correlations into transparent, auditable business risks."
    }
  },
  {
    id: "http_sink",
    name: "Confluent HTTP Sink V2 Connector",
    category: "Action Dispatch",
    tech: "io.confluent.connect.http.HttpSinkConnector",
    description: "Consumes recovery recommendations from Kafka and dispatches structured webhooks to the Recovery API.",
    details: {
      specs: [
        "Subscribes to 'recovery-actions' topic",
        "Automatic exponential backoff retries & idempotency key forwarding",
        "Dead-letter queue on terminal failures"
      ],
      confluentRole: "Closes the loop from stream detection to automated business action."
    }
  },
  {
    id: "api",
    name: "FastAPI Recovery Core & WebSockets",
    category: "Application Backend",
    tech: "Python FastAPI + SQLAlchemy + WebSockets",
    description: "Enforces action allow-lists, validates idempotency, logs execution receipts, and broadcasts live events.",
    details: {
      specs: [
        "Safe predefined recovery actions allow-list",
        "Deduplication using unique idempotency keys",
        "Low-latency WebSocket broadcast to connected browser clients"
      ],
      confluentRole: "Enterprise execution surface coordinating CRM, WhatsApp, and discount delivery."
    }
  },
  {
    id: "ui",
    name: "PulseRecover Enterprise Dashboard",
    category: "Operations Surface",
    tech: "Next.js + TypeScript + Tailwind CSS",
    description: "Mission-control dashboard giving support, revenue, and SRE teams live visibility and 1-click recovery controls.",
    details: {
      specs: [
        "Zero-reload live streaming timeline updates",
        "Interactive scenario simulator for deterministic stakeholder demos",
        "Comprehensive business impact and ROI metrics tracking"
      ],
      confluentRole: "Visual command center demonstrating Confluent's measurable business value."
    }
  }
];

export function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<NodeData>(NODES[3]); // Default Kafka

  return (
    <div className="space-y-6">
      {/* Top Architecture Pipeline Ribbon */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight mb-1">
          End-to-End Confluent Cloud Streaming Pipeline
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Click on any architectural component below to inspect its configuration, Kafka topics, and Flink statements.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
          {NODES.slice(0, 5).map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-3 rounded text-left border transition-all ${
                selectedNode.id === node.id
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:bg-white text-slate-700"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-75">
                {node.category}
              </span>
              <span className="text-xs font-bold block mt-1 truncate">
                {node.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center my-2 text-slate-300">
          <span className="text-xs font-mono font-medium text-slate-400">
            ↓ Real-time Streaming Stream Data Flow ↓
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
          {NODES.slice(5).map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-3 rounded text-left border transition-all ${
                selectedNode.id === node.id
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:bg-white text-slate-700"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-75">
                {node.category}
              </span>
              <span className="text-xs font-bold block mt-1 truncate">
                {node.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Component Inspector Panel */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {selectedNode.category}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {selectedNode.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Technology: {selectedNode.tech}
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Node: <span className="font-mono text-slate-800 font-bold">{selectedNode.id}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-[11px] text-slate-400">
              Role in Confluent Architecture
            </h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              {selectedNode.details.confluentRole}
            </p>

            <h4 className="font-semibold text-slate-900 text-xs mt-4 mb-2 uppercase tracking-wider text-[11px] text-slate-400">
              Technical Specifications
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              {selectedNode.details.specs.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-[11px] text-slate-400">
              Description & Capabilities
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {selectedNode.description}
            </p>

            {selectedNode.details.sample && (
              <div className="mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Sample Data / Query:
                </span>
                <pre className="bg-slate-950 text-slate-200 p-3 rounded text-[11px] font-mono overflow-x-auto border border-slate-800">
                  {typeof selectedNode.details.sample === "string"
                    ? selectedNode.details.sample
                    : JSON.stringify(selectedNode.details.sample, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
