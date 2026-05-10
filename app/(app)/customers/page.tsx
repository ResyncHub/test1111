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
        .then(data => { setCustomers(data); setLoading(false); });
    }, 300);
    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div className="py-4">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Szukaj klientów..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : customers.length === 0 ? (
        <EmptyState icon="👥" title="Brak klientów" description="Dodaj pierwszego klienta" />
      ) : (
        <div className="space-y-2">
          {customers.map(c => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 active:bg-gray-50 transition-colors">
                <p className="font-semibold text-sm text-gray-900">{c.full_name}</p>
                <div className="flex gap-3 mt-1">
                  {c.phone && <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11}/>{c.phone}</span>}
                  {c.city  && <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11}/>{c.city}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link href="/customers/new" className="fixed right-4 bottom-24 z-40 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
        <Plus size={24} />
      </Link>
    </div>
  );
}
