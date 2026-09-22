"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Zap,
  BarChart3,
  Network,
  Sliders,
  Radio
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Live Customers", href: "/customers", icon: Users },
  { name: "Event Stream", href: "/events", icon: Activity },
  { name: "Risk Monitor", href: "/risk", icon: ShieldAlert },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Recovery Actions", href: "/recovery", icon: Zap },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Architecture", href: "/architecture", icon: Network },
  { name: "Settings", href: "/settings", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#E5E7EB] bg-white flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs tracking-wider">
              PR
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-slate-900 leading-tight">
                PulseRecover
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight">
                AI Revenue Rescue
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-0.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Confluent Backbone Status */}
      <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-[12px] font-medium text-slate-700">Confluent Flink</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200/60 px-1.5 py-0.5 rounded">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Cluster: <span className="font-mono text-slate-700">pulse-recover-kafka</span>
        </p>
      </div>
    </aside>
  );
}
