"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { ShieldAlert, AlertTriangle, Users, TrendingUp, BarChart2 } from "lucide-react";

export default function RiskMonitorPage() {
  const [riskData, setRiskData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      const data = await api.getRisk();
      setRiskData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const dist = riskData?.distribution || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const total = (dist.LOW + dist.MEDIUM + dist.HIGH + dist.CRITICAL) || 1;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Customer Risk Monitor"
        subtitle="Distribution, root causes, and affected customer segments derived from streaming telemetry"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Risk Distribution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Low Risk (0–29%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {dist.LOW}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {Math.round((dist.LOW / total) * 100)}% of total
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(dist.LOW / total) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider block">
              Medium Risk (30–59%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {dist.MEDIUM}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {Math.round((dist.MEDIUM / total) * 100)}% of total
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${(dist.MEDIUM / total) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
              High Risk (60–79%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {dist.HIGH}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {Math.round((dist.HIGH / total) * 100)}% of total
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${(dist.HIGH / total) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
              Critical Risk (80–100%)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {dist.CRITICAL}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {Math.round((dist.CRITICAL / total) * 100)}% of total
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${(dist.CRITICAL / total) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Top Causes Breakdown & Segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Causes */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
              <AlertTriangle className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Top Primary Friction Causes
              </h2>
            </div>

            <div className="space-y-3.5">
              {riskData?.top_causes?.map((cause: any, idx: number) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">{cause.cause}</span>
                    <span className="font-mono text-slate-500 font-bold">{cause.count} occurrences ({cause.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full" style={{ width: `${cause.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Customer Segments */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
              <Users className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Affected Customer Segments
              </h2>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {riskData?.affected_segments?.map((seg: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{seg.segment}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-mono border border-amber-200">
                      {seg.at_risk} At-Risk
                    </span>
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-mono border border-rose-200">
                      {seg.critical} Critical
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
