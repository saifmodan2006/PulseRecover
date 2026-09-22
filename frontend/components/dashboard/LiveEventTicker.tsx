import Link from "next/link";
import { StreamEvent } from "@/types";
import { Activity, Radio, ExternalLink } from "lucide-react";

interface LiveEventTickerProps {
  events: StreamEvent[];
}

export function LiveEventTicker({ events }: LiveEventTickerProps) {
  const getTopicColor = (topic: string) => {
    switch (topic) {
      case "payment-events":
        return "text-indigo-700 bg-indigo-50 border-indigo-200";
      case "support-events":
        return "text-cyan-700 bg-cyan-50 border-cyan-200";
      case "customer-risk":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "recovery-actions":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "system-anomalies":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Live Streaming Activity
          </h2>
        </div>
        <Link
          href="/events"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          Event Inspector <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-[#E5E7EB] overflow-y-auto max-h-80 text-xs">
        {events.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Waiting for streaming events from Confluent Kafka...
          </div>
        ) : (
          events.slice(0, 10).map((evt, idx) => (
            <div
              key={idx}
              className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold shrink-0 ${getTopicColor(
                    evt.topic
                  )}`}
                >
                  {evt.topic}
                </span>
                <span className="font-medium text-slate-900 truncate">
                  {evt.event_type}
                </span>
                <span className="text-slate-400 text-[11px] font-mono shrink-0">
                  [{evt.customer_id}]
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono shrink-0">
                {evt.time ? new Date(evt.time).toLocaleTimeString() : "Just now"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
