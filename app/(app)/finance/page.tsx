"use client";

import { useEffect, useState } from "react";
import { formatPLN } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTHS = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];

interface MonthData { month: number; total_revenue: number; total_costs: number; profit: number; job_count: number; }

export default function FinancePage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finance/summary?year=${year}`)
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year]);

  const chartData = data.map(d => ({
    name: MONTHS[d.month - 1],
    Przychód: Number(d.total_revenue),
    Koszty:   Number(d.total_costs),
    Zysk:     Number(d.profit),
    zlecenia: d.job_count,
  }));

  const totals = data.reduce((acc, d) => ({
    revenue: acc.revenue + Number(d.total_revenue),
    costs:   acc.costs   + Number(d.total_costs),
    profit:  acc.profit  + Number(d.profit),
    jobs:    acc.jobs    + d.job_count,
  }), { revenue: 0, costs: 0, profit: 0, jobs: 0 });

  return (
    <div className="py-4 space-y-4">
      <div
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
      >
        <button onClick={() => setYear(y => y - 1)} className="text-lg px-2" style={{ color: "hsl(215 20% 55%)" }}>‹</button>
        <span className="font-bold" style={{ color: "hsl(210 40% 98%)" }}>{year}</span>
        <button onClick={() => setYear(y => y + 1)} className="text-lg px-2" style={{ color: "hsl(215 20% 55%)" }}>›</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Przychód roczny",  value: totals.revenue, color: "hsl(142 76% 46%)", isAmount: true },
          { label: "Koszty roczne",    value: totals.costs,   color: "hsl(0 72% 61%)", isAmount: true },
          { label: "Zysk roczny",      value: totals.profit,  color: "hsl(217 91% 60%)", isAmount: true },
          { label: "Liczba zleceń",    value: totals.jobs,    color: "hsl(215 20% 65%)", isAmount: false, unit: " szt." },
        ].map(card => (
          <div key={card.label} className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
            <p className="text-xs mb-1" style={{ color: "hsl(215 20% 45%)" }}>{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>
              {card.isAmount ? formatPLN(card.value as number) : `${card.value}${(card as { unit?: string }).unit ?? ""}`}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-48 rounded-xl animate-pulse" style={{ background: "hsl(217 33% 12%)" }} />
      ) : (
        <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(215 20% 55%)" }}>PRZYCHODY VS KOSZTY</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} tickFormatter={v => `${Math.round(v/1000)}k`} />
              <Tooltip formatter={(v) => formatPLN(Number(v))} contentStyle={{ background: "hsl(222 47% 7%)", border: "1px solid hsl(217 33% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215 20% 55%)" }} />
              <Bar dataKey="Przychód" fill="hsl(142 76% 36%)" radius={[3,3,0,0]} />
              <Bar dataKey="Koszty" fill="hsl(0 72% 51%)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <div className="grid grid-cols-4 px-4 py-2 text-xs font-medium" style={{ background: "hsl(217 33% 10%)", color: "hsl(215 20% 55%)" }}>
          <span>Miesiąc</span><span className="text-right">Przychód</span><span className="text-right">Koszty</span><span className="text-right">Zysk</span>
        </div>
        {data.map(d => (
          <div key={d.month} className="grid grid-cols-4 px-4 py-2.5 border-t text-xs" style={{ borderColor: "hsl(217 33% 13%)" }}>
            <span className="font-medium" style={{ color: "hsl(210 40% 90%)" }}>{MONTHS[d.month - 1]}</span>
            <span className="text-right" style={{ color: "hsl(142 76% 46%)" }}>{d.total_revenue > 0 ? formatPLN(Number(d.total_revenue)) : "—"}</span>
            <span className="text-right" style={{ color: "hsl(0 72% 61%)" }}>{d.total_costs > 0 ? formatPLN(Number(d.total_costs)) : "—"}</span>
            <span className="text-right font-semibold" style={{ color: Number(d.profit) >= 0 ? "hsl(217 91% 60%)" : "hsl(0 72% 61%)" }}>
              {d.total_revenue > 0 || d.total_costs > 0 ? formatPLN(Number(d.profit)) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
