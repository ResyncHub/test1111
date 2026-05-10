"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/types";
import { formatPLN } from "@/lib/utils";
import Link from "next/link";
import { Briefcase, CalendarCheck, TrendingUp, AlertCircle, Plus, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<{ id: string; title: string; status: string; scheduled_at: string | null }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/dashboard").then(r => r.json()),
      fetch("/api/jobs?limit=5").then(r => r.json()),
    ]).then(([s, jobs]) => { setStats(s); setRecentJobs(jobs); });
  }, []);

  const statCards = stats ? [
    { label: "Dziś", value: stats.todayJobsCount, unit: "zleceń", icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Otwarte", value: stats.openJobsCount, unit: "aktywnych", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Do opłacenia", value: stats.unpaidJobsCount, unit: "zakończonych", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
    { label: "Zysk miesiąc", value: formatPLN(stats.monthProfit), unit: "", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ] : [];

  return (
    <div className="py-4 space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dzień dobry!</h2>
        <p className="text-sm text-gray-400">{new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats === null ? (
          [1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
        ) : statCards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className={card.color} />
              <span className="text-xs text-gray-500">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            {card.unit && <p className="text-xs text-gray-400">{card.unit}</p>}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/jobs/new" className="flex items-center gap-2 bg-primary text-white rounded-xl p-3 active:scale-95 transition-transform">
          <Plus size={18} /><span className="text-sm font-medium">Nowe zlecenie</span>
        </Link>
        <Link href="/chat" className="flex items-center gap-2 bg-violet-500 text-white rounded-xl p-3 active:scale-95 transition-transform">
          <Sparkles size={18} /><span className="text-sm font-medium">Zapytaj asystenta</span>
        </Link>
      </div>

      {/* Ostatnie zlecenia */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">Ostatnie zlecenia</h3>
          <Link href="/jobs" className="text-xs text-primary">Zobacz wszystkie</Link>
        </div>
        <div className="space-y-2">
          {recentJobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 active:bg-gray-50">
                <p className="text-sm font-medium text-gray-800 truncate">{job.title}</p>
                {job.scheduled_at && <p className="text-xs text-gray-400 mt-0.5">{new Date(job.scheduled_at).toLocaleDateString("pl-PL")}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Month finance summary */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-medium text-gray-500 mb-3">TEN MIESIĄC</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-400">Przychód</p>
              <p className="text-sm font-bold text-emerald-600">{formatPLN(stats.monthRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Koszty</p>
              <p className="text-sm font-bold text-red-500">{formatPLN(stats.monthCosts)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Zysk</p>
              <p className={`text-sm font-bold ${stats.monthProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatPLN(stats.monthProfit)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
