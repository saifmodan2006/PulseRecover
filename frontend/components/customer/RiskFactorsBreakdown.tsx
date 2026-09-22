import { RiskFactor } from "@/types";
import { PlusCircle, ShieldAlert } from "lucide-react";

interface RiskFactorsBreakdownProps {
  factors: RiskFactor[];
  score: number;
}

export function RiskFactorsBreakdown({ factors, score }: RiskFactorsBreakdownProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Transparent Risk Factor Attribution
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-slate-800">
          Total: +{score} pts
        </span>
      </div>

      {factors.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No negative risk factors currently detected on this journey.
        </div>
      ) : (
        <div className="space-y-2.5">
          {factors.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>{f.signal}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {f.description}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                  +{f.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
