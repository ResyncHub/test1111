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
    ]).then(([s, jobs]) => {
      setStats(s?.error ? null : s);
      setRecentJobs(Array.isArray(jobs) ? jobs : []);
    }).catch(() => {
      setStats(null);
      setRecentJobs([]);
    });
  }, []);

  const statCards = stats ? [
    {
      label: "Dziś",
      value: stats.todayJobsCount,
      unit: "zleceń",
      icon: CalendarCheck,
      iconColor: "hsl(217 91% 60%)",
      iconBg: "hsla(217,91%,60%,0.12)",
      valueColor: "hsl(217 91% 60%)",
    },
    {
      label: "Otwarte",
      value: stats.openJobsCount,
      unit: "aktywnych",
      icon: Briefcase,
      iconColor: "hsl(38 92% 60%)",
      iconBg: "hsla(38,92%,50%,0.12)",
      valueColor: "hsl(38 92% 60%)",
    },
    {
      label: "Do opłacenia",
      value: stats.unpaidJobsCount,
      unit: "zakończonych",
      icon: AlertCircle,
      iconColor: "hsl(0 72% 61%)",
      iconBg: "hsla(0,72%,51%,0.12)",
      valueColor: "hsl(0 72% 61%)",
    },
    {
      label: "Zysk miesiąc",
      value: formatPLN(stats.monthProfit),
      unit: "",
      icon: TrendingUp,
      iconColor: "hsl(142 76% 46%)",
      iconBg: "hsla(142,76%,36%,0.12)",
      valueColor: "hsl(142 76% 46%)",
    },
  ] : [];

  return (
    <div className="py-4 space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "hsl(210 40% 98%)" }}>Dzień dobry!</h2>
        <p className="text-sm" style={{ color: "hsl(215 20% 55%)" }}>
          {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats === null ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "hsl(217 33% 12%)" }} />
          ))
        ) : statCards.map(card => (
          <div
            key={card.label}
            className="rounded-xl p-4 border"
            style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: card.iconBg }}>
                <card.icon size={13} style={{ color: card.iconColor }} />
              </div>
              <span className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.valueColor }}>{card.value}</p>
            {card.unit && <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 45%)" }}>{card.unit}</p>}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 rounded-xl p-3 active:scale-95 transition-transform"
          style={{ background: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" }}
        >
          <Plus size={18} /><span className="text-sm font-medium">Nowe zlecenie</span>
        </Link>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-xl p-3 active:scale-95 transition-transform"
          style={{ background: "hsla(262,80%,60%,0.85)", color: "white" }}
        >
          <Sparkles size={18} /><span className="text-sm font-medium">Zapytaj asystenta</span>
        </Link>
      </div>

      {/* Ostatnie zlecenia */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm" style={{ color: "hsl(210 40% 98%)" }}>Ostatnie zlecenia</h3>
          <Link href="/jobs" className="text-xs" style={{ color: "hsl(217 91% 60%)" }}>Zobacz wszystkie</Link>
        </div>
        <div className="space-y-2">
          {recentJobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div
                className="rounded-xl border px-4 py-3 transition-colors active:opacity-80"
                style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
              >
                <p className="text-sm font-medium truncate" style={{ color: "hsl(210 40% 98%)" }}>{job.title}</p>
                {job.scheduled_at && (
                  <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 45%)" }}>
                    {new Date(job.scheduled_at).toLocaleDateString("pl-PL")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Month finance summary */}
      {stats && (
        <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(215 20% 55%)" }}>
            TEN MIESIĄC
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Przychód</p>
              <p className="text-sm font-bold" style={{ color: "hsl(142 76% 46%)" }}>{formatPLN(stats.monthRevenue)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Koszty</p>
              <p className="text-sm font-bold" style={{ color: "hsl(0 72% 61%)" }}>{formatPLN(stats.monthCosts)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Zysk</p>
              <p className="text-sm font-bold" style={{ color: stats.monthProfit >= 0 ? "hsl(217 91% 60%)" : "hsl(0 72% 61%)" }}>
                {formatPLN(stats.monthProfit)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
