import Link from "next/link";
import { Incident } from "@/types";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface ActiveIncidentsCardProps {
  incidents: Incident[];
}

export function ActiveIncidentsCard({ incidents }: ActiveIncidentsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Active System Incidents
          </h2>
        </div>
        <Link
          href="/incidents"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="text-xs text-slate-400 py-3">No active incidents. Systems operational.</div>
        ) : (
          incidents.slice(0, 2).map((inc) => (
            <div
              key={inc.id}
              className="p-3.5 rounded border border-amber-200/70 bg-amber-50/40 text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-900">{inc.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {inc.severity}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-2">
                <div>
                  <span className="text-slate-400">Affected Customers:</span>{" "}
                  <span className="font-mono font-semibold text-slate-900">{inc.affected_customers}</span>
                </div>
                <div>
                  <span className="text-slate-400">Failure Rate:</span>{" "}
                  <span className="font-mono font-semibold text-rose-700">{inc.failure_rate}%</span>{" "}
                  <span className="text-[10px] text-slate-400">(base: {inc.baseline_rate}%)</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
