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
      .then(d => { setData(d); setLoading(false); });
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
      {/* Year picker */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <button onClick={() => setYear(y => y - 1)} className="text-gray-400 text-lg px-2">‹</button>
        <span className="font-bold text-gray-900">{year}</span>
        <button onClick={() => setYear(y => y + 1)} className="text-gray-400 text-lg px-2">›</button>
      </div>

      {/* Annual totals */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Przychód roczny",  value: totals.revenue, color: "text-emerald-600" },
          { label: "Koszty roczne",    value: totals.costs,   color: "text-red-500" },
          { label: "Zysk roczny",      value: totals.profit,  color: "text-blue-600" },
          { label: "Liczba zleceń",    value: totals.jobs,    color: "text-gray-700", unit: " szt." },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>
              {typeof card.value === "number" && !("unit" in card) ? formatPLN(card.value) : `${card.value}${(card as {unit?: string}).unit ?? ""}`}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">PRZYCHODY VS KOSZTY</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v/1000)}k`} />
              <Tooltip formatter={(v) => formatPLN(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Przychód" fill="#10b981" radius={[3,3,0,0]} />
              <Bar dataKey="Koszty"   fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
          <span>Miesiąc</span><span className="text-right">Przychód</span><span className="text-right">Koszty</span><span className="text-right">Zysk</span>
        </div>
        {data.map(d => (
          <div key={d.month} className="grid grid-cols-4 px-4 py-2.5 border-t border-gray-100 text-xs">
            <span className="text-gray-700 font-medium">{MONTHS[d.month - 1]}</span>
            <span className="text-right text-emerald-600">{d.total_revenue > 0 ? formatPLN(Number(d.total_revenue)) : "—"}</span>
            <span className="text-right text-red-500">{d.total_costs > 0 ? formatPLN(Number(d.total_costs)) : "—"}</span>
            <span className={`text-right font-semibold ${Number(d.profit) >= 0 ? "text-blue-600" : "text-red-600"}`}>{d.total_revenue > 0 || d.total_costs > 0 ? formatPLN(Number(d.profit)) : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
