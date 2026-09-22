"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Radio, Bell, HelpCircle } from "lucide-react";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  isLive?: boolean;
}

export function TopBar({ title = "Operations Overview", subtitle, isLive = true }: TopBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith("C")) {
      router.push(`/customers/${query}`);
    } else if (query.startsWith("INC")) {
      router.push(`/incidents`);
    } else {
      router.push(`/customers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Context */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 font-normal leading-tight mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Global Search and Status Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Customer (e.g. C1029), Incident, Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded border border-[#E5E7EB] bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </form>

        {/* Environment Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>pulse-recover-prod</span>
        </div>

        {/* Live Stream Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-200/80 bg-emerald-50 text-[11px] font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Stream</span>
        </div>

        {/* Help / Docs quick link */}
        <a
          href="/architecture"
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Streaming Architecture"
        >
          <HelpCircle className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
