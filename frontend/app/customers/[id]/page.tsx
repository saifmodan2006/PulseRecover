"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { RiskScoreGauge } from "@/components/customer/RiskScoreGauge";
import { RiskFactorsBreakdown } from "@/components/customer/RiskFactorsBreakdown";
import { CustomerTimeline } from "@/components/customer/CustomerTimeline";
import { RecoveryActionModal } from "@/components/customer/RecoveryActionModal";
import { api } from "@/lib/api";
import { useLiveStream } from "@/hooks/useLiveStream";
import { Customer, RiskFactor, StreamEvent } from "@/types";
import { ArrowLeft, User, DollarSign, AlertCircle, Sparkles, CheckCircle2, Zap } from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [factors, setFactors] = useState<RiskFactor[]>([]);
  const [timeline, setTimeline] = useState<StreamEvent[]>([]);
  const [recommendation, setRecommendation] = useState<string>("PAYMENT_ASSISTANCE");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCustomer = useCallback(async () => {
    try {
      const data = await api.getCustomerDetail(customerId);
      setCustomer(data.customer);
      setFactors(data.factors || []);
      setTimeline(data.timeline || []);
      setRecommendation(data.recommendation || "PAYMENT_ASSISTANCE");
    } catch (e) {
      console.error("Error loading customer detail:", e);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useLiveStream(() => {
    loadCustomer();
  });

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
        Loading customer journey dossier...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex-1 p-12 text-center text-xs text-slate-500">
        Customer not found.{" "}
        <Link href="/customers" className="text-slate-900 underline font-medium">
          Return to customer list
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title={`Customer Dossier: ${customer.name} (${customer.customer_id})`}
        subtitle="Individual customer experience, risk attribution, and real-time intervention"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/customers"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
          </Link>

          <div className="flex items-center gap-3">
            <RecoveryActionModal
              customerId={customer.customer_id}
              customerName={customer.name}
              recommendedAction={recommendation}
              onActionSuccess={loadCustomer}
            />
          </div>
        </div>

        {/* Customer Profile & Identity Bar */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
              {customer.customer_id.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {customer.name}
                </h2>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {customer.customer_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{customer.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div>
              <span className="text-slate-400 block text-[11px]">Current Journey</span>
              <span className="font-semibold text-slate-800">{customer.current_journey}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Journey State</span>
              <span className="font-semibold text-slate-800">{customer.journey_state}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">AI Sentiment</span>
              <span className="font-semibold capitalize text-slate-800">
                {customer.sentiment} ({customer.sentiment_score})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Potential Value</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{customer.potential_value.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Gauges & Recommendation Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RiskScoreGauge
            score={customer.risk_score}
            level={customer.risk_score >= 80 ? "CRITICAL" : customer.risk_score >= 60 ? "HIGH" : customer.risk_score >= 30 ? "MEDIUM" : "LOW"}
            status={customer.status}
          />

          <div className="md:col-span-2 space-y-4">
            {/* Recommended Action Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Automated Recovery Recommendation
                </h3>
              </div>
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Recommended Action Type:
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {recommendation}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Primary Issue: <strong className="text-slate-700">{customer.primary_issue}</strong>
                  </p>
                </div>

                <RecoveryActionModal
                  customerId={customer.customer_id}
                  customerName={customer.name}
                  recommendedAction={recommendation}
                  onActionSuccess={loadCustomer}
                />
              </div>
            </div>

            {/* Risk Factor Breakdown */}
            <RiskFactorsBreakdown factors={factors} score={customer.risk_score} />
          </div>
        </div>

        {/* Real-time Journey Timeline */}
        <CustomerTimeline events={timeline} />
      </div>
    </div>
  );
}
