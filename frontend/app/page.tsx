"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { CriticalCustomersTable } from "@/components/dashboard/CriticalCustomersTable";
import { LiveEventTicker } from "@/components/dashboard/LiveEventTicker";
import { ActiveIncidentsCard } from "@/components/dashboard/ActiveIncidentsCard";
import { RecentActionsCard } from "@/components/dashboard/RecentActionsCard";
import { api } from "@/lib/api";
import { useLiveStream } from "@/hooks/useLiveStream";
import { Customer, Incident, RecoveryAction, BusinessKPIs } from "@/types";
import { Users, ShieldAlert, CheckCircle2, DollarSign, TrendingUp } from "lucide-react";

export default function OverviewPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [kpis, setKpis] = useState<BusinessKPIs | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const [custRes, incRes, actRes, analRes] = await Promise.all([
        api.getCustomers(),
        api.getIncidents(),
        api.getRecoveryActions(),
        api.getAnalytics()
      ]);
      setCustomers(custRes);
      setIncidents(incRes);
      setActions(actRes);
      setKpis(analRes.kpis);
      setTrends(analRes.trends);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hook live stream WebSocket
  const { events } = useLiveStream(() => {
    // Refresh table metrics on incoming stream event
    loadData();
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Revenue Protection & Experience Command Center"
        subtitle="Real-time multi-stream correlation powered by Confluent Cloud & Apache Flink"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* KPI Metric Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="At-Risk Customers"
            value={kpis?.at_risk_customers ?? "—"}
            subtitle="Risk score ≥ 30"
            change="+4 last hour"
            isPositive={false}
            icon={<Users className="w-4 h-4" />}
          />
          <KpiCard
            title="Critical Risk"
            value={kpis?.critical_risk_customers ?? "—"}
            subtitle="Risk score ≥ 80"
            change="Immediate action needed"
            isPositive={false}
            icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
          />
          <KpiCard
            title="Recovered Customers"
            value={kpis?.recovered_customers ?? "—"}
            subtitle="Friction successfully cleared"
            change="+12 today"
            isPositive={true}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          />
          <KpiCard
            title="Revenue at Risk"
            value={kpis ? `₹${kpis.estimated_revenue_at_risk.toLocaleString("en-IN")}` : "—"}
            subtitle="Cart & checkout value"
            isPositive={false}
            icon={<DollarSign className="w-4 h-4 text-amber-500" />}
          />
          <KpiCard
            title="Recovery Rate"
            value={kpis ? `${kpis.recovery_rate}%` : "—"}
            subtitle="Target SLA: 75%"
            change="Strong recovery"
            isPositive={true}
            icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
          />
        </div>

        {/* Charts & Real-Time Event Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RiskTrendChart data={trends} />
          </div>
          <div>
            <LiveEventTicker events={events} />
          </div>
        </div>

        {/* Critical Customers Table */}
        <CriticalCustomersTable customers={customers} />

        {/* Incidents and Recent Recovery Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActiveIncidentsCard incidents={incidents} />
          <RecentActionsCard actions={actions} />
        </div>
      </div>
    </div>
  );
}
