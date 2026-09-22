import Link from "next/link";
import { RecoveryAction } from "@/types";
import { Zap, CheckCircle2, Clock, ArrowRight } from "lucide-react";

interface RecentActionsCardProps {
  actions: RecoveryAction[];
}

export function RecentActionsCard({ actions }: RecentActionsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Recent Recovery Actions
          </h2>
        </div>
        <Link
          href="/recovery"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          Action Center <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {actions.length === 0 ? (
          <div className="text-xs text-slate-400 py-3">
            No recovery actions triggered yet. Use the demo toolbar above to trigger a scenario.
          </div>
        ) : (
          actions.slice(0, 3).map((act) => (
            <div
              key={act.id}
              className="p-3 rounded border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 font-mono text-[11px]">
                    {act.action_type}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    [{act.customer_id}]
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                  {act.result || (act.reason && act.reason[0]) || "Automated friction remediation"}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {act.status}
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {act.executed_at ? new Date(act.executed_at).toLocaleTimeString() : "Recent"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
