interface RiskScoreGaugeProps {
  score: number;
  level: string;
  status: string;
}

export function RiskScoreGauge({ score, level, status }: RiskScoreGaugeProps) {
  const getColor = () => {
    if (score >= 80) return { bg: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-200" };
    if (score >= 60) return { bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200" };
    if (score >= 30) return { bg: "bg-yellow-500", text: "text-yellow-700", ring: "ring-yellow-200" };
    return { bg: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200" };
  };

  const c = getColor();

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col items-center text-center">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Customer Risk Score
      </span>

      <div className="my-4 relative flex items-center justify-center">
        <div className={`w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center shadow-inner`}>
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-extrabold tracking-tight font-mono ${c.text}`}>
              {score}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">/ 100</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
          score >= 80 ? "bg-rose-50 text-rose-800 border-rose-200" :
          score >= 60 ? "bg-amber-50 text-amber-800 border-amber-200" :
          score >= 30 ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
          "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}>
          {level} RISK
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Status: <strong className="text-slate-800">{status}</strong>
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mt-3 max-w-xs">
        Computed continuously across multi-stream Flink windows with transparent mathematical explainability.
      </p>
    </div>
  );
}
