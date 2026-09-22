"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { Customer } from "@/types";
import { Search, Filter, ArrowUpRight, ShieldAlert } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [journeyFilter, setJourneyFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, [statusFilter, journeyFilter]);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers({
        status: statusFilter !== "all" ? statusFilter : undefined,
        journey_state: journeyFilter !== "all" ? journeyFilter : undefined
      });
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.customer_id.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.primary_issue.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Live Customer Journeys"
        subtitle="Continuous risk scoring and journey monitoring across active sessions"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Filters and Search Bar */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer ID, Name, or Issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded border border-[#E5E7EB] bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-[#E5E7EB] rounded px-2 py-1 text-slate-800 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Recovered">Recovered</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Journey:</span>
              <select
                value={journeyFilter}
                onChange={(e) => setJourneyFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-[#E5E7EB] rounded px-2 py-1 text-slate-800 focus:outline-none"
              >
                <option value="all">All Journey States</option>
                <option value="NORMAL">NORMAL</option>
                <option value="AT_RISK">AT_RISK</option>
                <option value="HIGH_RISK">HIGH_RISK</option>
                <option value="RECOVERED">RECOVERED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Current Journey</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Primary Issue</th>
                <th className="py-2.5 px-4">Sentiment</th>
                <th className="py-2.5 px-4 text-right">Potential Value</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customers matching the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/customers/${c.customer_id}`}
                        className="font-medium text-slate-900 hover:underline flex items-center gap-1.5"
                      >
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {c.customer_id}
                        </span>
                        <span className="text-slate-500 text-xs font-normal">
                          ({c.name})
                        </span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {c.current_journey}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          c.risk_score >= 80
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : c.risk_score >= 60
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : c.risk_score >= 30
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {c.risk_score}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {c.primary_issue}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border capitalize bg-slate-50 text-slate-600 border-slate-200">
                        {c.sentiment}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      ₹{c.potential_value.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium border bg-slate-100 text-slate-700 border-slate-200">
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/customers/${c.customer_id}`}
                        className="text-xs font-semibold text-slate-800 hover:text-slate-950 inline-flex items-center gap-0.5"
                      >
                        View Dossier <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
