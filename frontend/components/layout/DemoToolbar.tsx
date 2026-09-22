"use client";

import { useState } from "react";
import { Play, RotateCcw, CheckCircle2, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

interface DemoToolbarProps {
  onScenarioTriggered?: () => void;
}

export function DemoToolbar({ onScenarioTriggered }: DemoToolbarProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);

  const handleTrigger = async (scenario: string, label: string) => {
    setIsRunning(true);
    setCurrentScenario(label);
    setStatusMessage(`Triggering scenario: ${label}...`);
    try {
      const res = await api.triggerScenario(scenario, "C1029");
      setStatusMessage(
        `Scenario '${label}' produced to Kafka topics. Risk evaluated: ${res.final_risk_score ?? "Updated"} (${res.risk_level ?? "Updated"}).`
      );
      if (onScenarioTriggered) {
        onScenarioTriggered();
      }
    } catch (e: any) {
      setStatusMessage(`Error executing scenario: ${e.message}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 7000);
    }
  };

  const handleReset = async () => {
    setIsRunning(true);
    setStatusMessage("Resetting demo environment to baseline...");
    try {
      await api.resetDemo();
      setStatusMessage("Demo state successfully reset.");
      if (onScenarioTriggered) {
        onScenarioTriggered();
      }
    } catch (e: any) {
      setStatusMessage(`Reset error: ${e.message}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="bg-slate-900 text-white px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 text-xs shadow-sm">
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Confluent Story Mode:
        </span>
        <span className="text-slate-400 text-[11px] hidden sm:inline">
          Deterministic Kafka & Flink Scenarios
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleTrigger("payment_failure", "Payment Failure (C1029)")}
          disabled={isRunning}
          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded font-medium transition-colors flex items-center gap-1 shadow-sm"
          title="Executes the core presentation scenario: repeated payment failure -> support complaint -> Flink risk correlation -> automated recovery"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Payment Failure (C1029)</span>
        </button>

        <button
          onClick={() => handleTrigger("normal_journey", "Normal Journey")}
          disabled={isRunning}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded font-medium transition-colors"
        >
          Normal Journey
        </button>

        <button
          onClick={() => handleTrigger("angry_customer", "Angry Customer")}
          disabled={isRunning}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded font-medium transition-colors"
        >
          Negative Sentiment
        </button>

        <button
          onClick={() => handleTrigger("delivery_delay", "Delivery Delay")}
          disabled={isRunning}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded font-medium transition-colors"
        >
          Delivery Delay
        </button>

        <button
          onClick={() => handleTrigger("website_slowdown", "Website Slowdown")}
          disabled={isRunning}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded font-medium transition-colors"
        >
          Website Latency Spike
        </button>

        <button
          onClick={handleReset}
          disabled={isRunning}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded font-medium transition-colors flex items-center gap-1 border border-slate-700 ml-1"
          title="Reset database and in-memory event bus back to clean demo state"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>
      </div>

      {statusMessage && (
        <div className="text-[11px] text-emerald-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 flex items-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate max-w-xs">{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
