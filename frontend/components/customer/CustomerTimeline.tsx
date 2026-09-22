import { StreamEvent } from "@/types";
import { CheckCircle2, Clock, AlertTriangle, MessageSquare, CreditCard, ShoppingBag, Zap, Shield } from "lucide-react";

interface CustomerTimelineProps {
  events: StreamEvent[];
}

export function CustomerTimeline({ events }: CustomerTimelineProps) {
  const getIcon = (eventType: string) => {
    switch (eventType) {
      case "payment_failed":
      case "payment_retry":
        return <CreditCard className="w-3.5 h-3.5 text-rose-600" />;
      case "payment_success":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case "support_message":
      case "ticket_created":
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />;
      case "risk_evaluated":
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      case "PAYMENT_ASSISTANCE":
      case "recovery_action":
      case "RECOVERED":
        return <Zap className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatEventName = (eventType: string) => {
    return eventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Real-Time Customer Journey Timeline
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Correlated Stream Events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No events recorded for this customer journey yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((evt, idx) => (
            <div key={idx} className="relative group text-xs">
              {/* Circle Marker */}
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center group-hover:border-slate-500 transition-colors shadow-xs">
                {getIcon(evt.event_type)}
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {formatEventName(evt.event_type)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-1 py-0.2 rounded">
                    {evt.topic}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {evt.time ? new Date(evt.time).toLocaleTimeString() : "Recent"}
                </span>
              </div>

              {/* Payload Highlights */}
              {evt.payload && (
                <div className="mt-1 text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded border border-slate-100">
                  {evt.payload.failure_reason && (
                    <div className="text-rose-700 font-medium">
                      Failure Reason: {evt.payload.failure_reason} (retry #{evt.payload.retry_count ?? 0})
                    </div>
                  )}
                  {evt.payload.message && (
                    <div className="italic text-slate-700">
                      &ldquo;{evt.payload.message}&rdquo;
                      {evt.payload.sentiment && (
                        <span className="ml-2 font-semibold not-italic text-rose-600 uppercase text-[10px]">
                          [AI Sentiment: {evt.payload.sentiment}]
                        </span>
                      )}
                    </div>
                  )}
                  {evt.payload.risk_score !== undefined && (
                    <div className="font-semibold text-slate-800">
                      Risk Score evaluated to: <span className="text-rose-700">{evt.payload.risk_score}</span> / 100 ({evt.payload.risk_level})
                    </div>
                  )}
                  {evt.payload.action_type && (
                    <div className="font-semibold text-emerald-700">
                      Recovery Action: {evt.payload.action_type} - {evt.payload.status}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
