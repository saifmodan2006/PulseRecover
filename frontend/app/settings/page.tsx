"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { IntegrationItem } from "@/types";
import { Sliders, CheckCircle2, AlertCircle, ShieldCheck, Radio, Server, Database } from "lucide-react";

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getIntegrations();
      setIntegrations(data.integrations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Settings & Integration Status"
        subtitle="Operational status of Confluent Cloud, streaming engines, and database connections"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Active Backbone Connectors & Services
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {integrations.map((item, idx) => (
              <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 text-[11px] mt-1 font-mono">
                    {item.cluster && <span>Cluster: {item.cluster}</span>}
                    {item.environment && <span>Env: {item.environment}</span>}
                    {item.format && <span>Format: {item.format}</span>}
                    {item.windowing && <span>Window: {item.windowing}</span>}
                    {item.source_table && <span>Source: {item.source_table}</span>}
                    {item.target_endpoint && <span>Endpoint: {item.target_endpoint}</span>}
                    {item.messages_processed !== undefined && (
                      <span>Messages: {item.messages_processed}</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                      item.status.includes("Connected") || item.status.includes("Active") || item.status.includes("Ready")
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Credentials Safe Disclosure Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              Zero-Trust Credential Security Policy
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-500">
              Confluent API keys, Schema Registry secrets, and database credentials are kept strictly in backend-only environment variables and never transmitted or exposed to frontend code or client bundles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
