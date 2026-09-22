import Link from "next/link";
import { Customer } from "@/types";
import { ChevronRight, ArrowUpRight } from "lucide-react";

interface CriticalCustomersTableProps {
  customers: Customer[];
}

export function CriticalCustomersTable({ customers }: CriticalCustomersTableProps) {
  const getRiskBadge = (score: number) => {
    if (score >= 80) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    } else if (score >= 60) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    } else if (score >= 30) {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "negative":
        return "text-rose-600 bg-rose-50 border-rose-200";
      case "positive":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getJourneyStateBadge = (state: string) => {
    switch (state) {
      case "RECOVERED":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "HIGH_RISK":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "AT_RISK":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            High & Critical Risk Customers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming correlation derived from payment, support, and session events
          </p>
        </div>
        <Link
          href="/customers"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          View all customers <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Current Journey</th>
              <th className="py-2.5 px-4">Risk Score</th>
              <th className="py-2.5 px-4">Primary Issue</th>
              <th className="py-2.5 px-4">Sentiment</th>
              <th className="py-2.5 px-4 text-right">Potential Value</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No active customer risks. Real-time streaming monitoring active.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.customer_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getRiskBadge(
                          c.risk_score
                        )}`}
                      >
                        {c.risk_score}%
                      </span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${
                            c.risk_score >= 80
                              ? "bg-rose-500"
                              : c.risk_score >= 60
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${c.risk_score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate" title={c.primary_issue}>
                    {c.primary_issue}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border capitalize ${getSentimentBadge(
                        c.sentiment
                      )}`}
                    >
                      {c.sentiment}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                    ₹{c.potential_value.toLocaleString("en-IN")}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getJourneyStateBadge(
                        c.journey_state
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/customers/${c.customer_id}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                    >
                      Dossier <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
