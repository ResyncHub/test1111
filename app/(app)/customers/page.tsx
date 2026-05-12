"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/types";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { Phone, MapPin, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`)
        .then(r => r.json())
        .then(data => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div className="py-4">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(215 20% 45%)" }} />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Szukaj klientów..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "hsl(217 33% 12%)" }} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState icon="👥" title="Brak klientów" description="Dodaj pierwszego klienta" />
      ) : (
        <div className="space-y-2">
          {customers.map(c => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <div
                className="rounded-xl border px-4 py-3 transition-colors active:opacity-80"
                style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
              >
                <p className="font-semibold text-sm" style={{ color: "hsl(210 40% 98%)" }}>{c.full_name}</p>
                <div className="flex gap-3 mt-1">
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(215 20% 55%)" }}>
                      <Phone size={11}/>{c.phone}
                    </span>
                  )}
                  {c.city && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(215 20% 55%)" }}>
                      <MapPin size={11}/>{c.city}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/customers/new"
        className="fixed right-4 bottom-24 z-40 rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        style={{ background: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" }}
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
