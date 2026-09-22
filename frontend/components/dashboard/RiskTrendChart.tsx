"use client";

interface TrendData {
  time: string;
  risk_count: number;
  recovered_count: number;
  revenue_recovered: number;
}

interface RiskTrendChartProps {
  data: TrendData[];
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        Awaiting streaming metric window...
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.risk_count, d.recovered_count, 10)), 80);
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const pointsRisk = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.risk_count / maxVal) * (height - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");

  const pointsRecovered = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.recovered_count / maxVal) * (height - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Customer Friction & Recovery Velocity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tumbling 10m Flink stream windows
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600">At-Risk Customers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-600">Recovered Customers</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 select-none"
        >
          {/* Subtle grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#F3F4F6" strokeWidth="1" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#F3F4F6" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#E5E7EB" strokeWidth="1" />

          {/* Lines */}
          <polyline
            fill="none"
            stroke="#F43F5E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsRisk}
          />
          <polyline
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsRecovered}
          />

          {/* Dots on last data point */}
          {data.length > 0 && (
            <>
              {(() => {
                const lastI = data.length - 1;
                const lastD = data[lastI];
                const x = paddingX + (lastI / (data.length - 1)) * (width - paddingX * 2);
                const yR = height - paddingY - (lastD.risk_count / maxVal) * (height - paddingY * 2);
                const yRec = height - paddingY - (lastD.recovered_count / maxVal) * (height - paddingY * 2);
                return (
                  <>
                    <circle cx={x} cy={yR} r="4" fill="#F43F5E" />
                    <circle cx={x} cy={yRec} r="4" fill="#059669" />
                  </>
                );
              })()}
            </>
          )}

          {/* Time Labels */}
          {data.map((d, i) => {
            const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
            return (
              <text
                key={i}
                x={x}
                y={height - 4}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {d.time}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
