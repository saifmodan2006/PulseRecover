"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { Incident } from "@/types";
import { AlertTriangle, Clock, Users, Activity, CheckCircle2 } from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Operational Incidents & Outage Board"
        subtitle="Broad anomalies and multi-customer friction events detected in real time"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-12 text-center text-xs text-slate-400">
              No active or historical incidents recorded.
            </div>
          ) : (
            incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-white border border-[#E5E7EB] rounded-lg p-6 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : inc.severity === "HIGH"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {inc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      ID: {inc.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {inc.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                      <Users className="w-3 h-3" /> Affected Customers
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                      {inc.affected_customers}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Failure Rate
                    </span>
                    <span className="font-mono font-bold text-rose-700 text-sm mt-0.5 block">
                      {inc.failure_rate}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Baseline Normal</span>
                    <span className="font-mono font-semibold text-slate-600 text-sm mt-0.5 block">
                      {inc.baseline_rate}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Detected At
                    </span>
                    <span className="font-mono text-slate-600 text-xs mt-0.5 block">
                      {inc.started_at ? new Date(inc.started_at).toLocaleTimeString() : "Recent"}
                    </span>
                  </div>
                </div>

                {inc.details && (
                  <div className="mt-4 p-3 rounded bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    {inc.details}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
