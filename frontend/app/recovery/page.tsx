"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { RecoveryAction } from "@/types";
import { Zap, CheckCircle2, AlertCircle, RefreshCw, Key } from "lucide-react";

export default function RecoveryActionsPage() {
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadActions = async () => {
    try {
      const data = await api.getRecoveryActions();
      setActions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Recovery Action Center & Idempotency Guard"
        subtitle="Automated and manual customer interventions dispatched via Confluent HTTP Sink V2"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Dispatched Recovery Actions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every action enforces allow-lists and deduplication keys before execution
              </p>
            </div>
            <button
              onClick={loadActions}
              className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-slate-800"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4">Action ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Action Type</th>
                  <th className="py-2.5 px-4">Trigger</th>
                  <th className="py-2.5 px-4">Idempotency Key</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4">Result / Remediation</th>
                  <th className="py-2.5 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {actions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No recovery actions executed yet.
                    </td>
                  </tr>
                ) : (
                  actions.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {act.action_id}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/customers/${act.customer_id}`}
                          className="font-mono text-slate-700 hover:underline font-semibold"
                        >
                          {act.customer_id}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {act.action_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {act.trigger}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[140px]" title={act.idempotency_key}>
                        {act.idempotency_key}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[260px] truncate" title={act.result}>
                        {act.result || "Action successfully applied"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                        {act.executed_at ? new Date(act.executed_at).toLocaleTimeString() : "Recent"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
