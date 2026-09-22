"use client";

import { useState } from "react";
import { Zap, Check, AlertCircle, X } from "lucide-react";
import { api } from "@/lib/api";

interface RecoveryActionModalProps {
  customerId: string;
  customerName: string;
  recommendedAction?: string;
  onActionSuccess: () => void;
}

const ACTION_OPTIONS = [
  {
    type: "PAYMENT_ASSISTANCE",
    label: "Payment Assistance Link",
    description: "Dispatch instant WhatsApp/SMS zero-friction UPI link and reserve cart items."
  },
  {
    type: "PRIORITY_SUPPORT",
    label: "Priority Support Escalation",
    description: "Route ticket immediately to Tier-3 VIP live agent queue."
  },
  {
    type: "DISCOUNT_OFFER",
    label: "Instant Recovery Discount",
    description: "Apply 15% concession coupon code RECOVER15 directly to checkout."
  },
  {
    type: "ALTERNATIVE_PAYMENT",
    label: "Alternative Payment Fallback",
    description: "Switch default tender method to Instant NetBanking / Rupay tunnel."
  },
  {
    type: "DELIVERY_ESCALATION",
    label: "Logistics Carrier Priority",
    description: "Escalate delayed parcel to Express Air freight priority routing."
  },
  {
    type: "CUSTOMER_NOTIFICATION",
    label: "Proactive Apology Push",
    description: "Send push notification apologizing for website latency."
  }
];

export function RecoveryActionModal({
  customerId,
  customerName,
  recommendedAction = "PAYMENT_ASSISTANCE",
  onActionSuccess
}: RecoveryActionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(recommendedAction);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsLoading(true);
    setResultMessage(null);
    try {
      const res = await api.executeRecoveryAction(selectedAction, {
        customer_id: customerId,
        priority: "HIGH",
        reasons: ["Manual intervention by operations specialist"]
      });
      setResultMessage(res.message || "Action successfully executed");
      setTimeout(() => {
        setIsOpen(false);
        onActionSuccess();
      }, 1500);
    } catch (err: any) {
      setResultMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setSelectedAction(recommendedAction);
            setIsOpen(true);
          }}
          className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Trigger Recovery Action</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-6 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Execute Recovery Action
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Target Customer: <strong className="text-slate-800">{customerName} ({customerId})</strong>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-2 max-h-72 overflow-y-auto">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Predefined Safe Action Type:
              </label>
              {ACTION_OPTIONS.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => setSelectedAction(opt.type)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedAction === opt.type
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{opt.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">{opt.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{opt.description}</p>
                </div>
              ))}
            </div>

            {resultMessage && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs mb-3 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{resultMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={isLoading}
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isLoading ? "Executing..." : "Confirm & Trigger"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
