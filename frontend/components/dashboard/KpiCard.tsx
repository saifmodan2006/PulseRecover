import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: ReactNode;
  isSimulated?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  isSimulated = true
}: KpiCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive
                ? "text-emerald-700 bg-emerald-50 border border-emerald-200/50"
                : "text-rose-700 bg-rose-50 border border-rose-200/50"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>{subtitle || "Real-time Flink metric"}</span>
        {isSimulated && (
          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 border border-slate-200/60 px-1 py-0.5 rounded">
            Estimated
          </span>
        )}
      </div>
    </div>
  );
}
