"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { useLiveStream } from "@/hooks/useLiveStream";
import { StreamEvent } from "@/types";
import { Activity, Play, Pause, Search, Filter, RefreshCw, X, Code } from "lucide-react";

const TOPICS = [
  { id: "all", label: "All Topics" },
  { id: "customer-events", label: "customer-events" },
  { id: "payment-events", label: "payment-events" },
  { id: "support-events", label: "support-events" },
  { id: "order-events", label: "order-events" },
  { id: "delivery-events", label: "delivery-events" },
  { id: "customer-risk", label: "customer-risk" },
  { id: "recovery-actions", label: "recovery-actions" },
  { id: "system-anomalies", label: "system-anomalies" }
];

export default function EventStreamPage() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<StreamEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.getEvents(
        100,
        selectedTopic !== "all" ? selectedTopic : undefined,
        customerFilter ? customerFilter.trim() : undefined
      );
      setEvents(res.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic, customerFilter]);

  useLiveStream((newEvt) => {
    if (!isPaused) {
      if (
        (selectedTopic === "all" || newEvt.topic === selectedTopic) &&
        (!customerFilter || newEvt.customer_id.toLowerCase().includes(customerFilter.toLowerCase()))
      ) {
        setEvents((prev) => [newEvt, ...prev].slice(0, 100));
      }
    }
  });

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Live Kafka Event Stream Inspector"
        subtitle="Real-time event log across Confluent Cloud topics with Schema Registry validation"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Controls, Topic Filter and Pause */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="text-xs bg-slate-50 border border-[#E5E7EB] rounded px-2.5 py-1 text-slate-800 focus:outline-none"
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-44">
              <input
                type="text"
                placeholder="Filter Customer ID..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full text-xs px-2.5 py-1 rounded border border-[#E5E7EB] bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isPaused
                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? "Resume Stream" : "Pause Stream"}</span>
            </button>

            <button
              onClick={fetchEvents}
              className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              title="Refresh events"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Event Stream Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="p-3.5 border-b border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{events.length}</strong> events in active ring-buffer
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Streaming Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Topic</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Customer ID</th>
                  <th className="py-2.5 px-4">Source</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] font-mono">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      No events currently match the selected filters.
                    </td>
                  </tr>
                ) : (
                  events.map((evt, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedEvent(evt)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 text-[11px] text-slate-500">
                        {evt.time ? new Date(evt.time).toLocaleTimeString() : "Recent"}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] border font-semibold ${getTopicColor(
                            evt.topic
                          )}`}
                        >
                          {evt.topic}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 font-sans">
                        {evt.event_type}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {evt.customer_id}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px] font-sans">
                        {evt.source}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button className="text-[11px] font-sans font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                          <Code className="w-3 h-3" /> JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payload Inspection Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg border border-slate-200 max-w-xl w-full p-6 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Kafka Event Inspector
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">
                    Topic: {selectedEvent.topic} | Type: {selectedEvent.event_type}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Validated Schema Payload:
                </span>
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800">
                  {JSON.stringify(selectedEvent.payload || selectedEvent, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
