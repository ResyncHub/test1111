"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Customer, Job } from "@/types";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPLN } from "@/lib/utils";
import { Phone, Mail, MapPin, Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type CustomerWithJobs = Customer & { jobs: Job[] };

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerWithJobs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${id}`).then(r => r.json()).then(data => { setCustomer(data?.error ? null : data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function deleteCustomer() {
    if (!confirm("Usunąć klienta?")) return;
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Klient usunięty"); router.push("/customers"); }
    else toast.error("Błąd usuwania");
  }

  if (loading) return (
    <div className="py-8 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "hsl(217 33% 12%)" }} />
      ))}
    </div>
  );
  if (!customer) return (
    <div className="py-16 text-center" style={{ color: "hsl(215 20% 45%)" }}>Nie znaleziono klienta</div>
  );

  const totalRevenue = (customer.jobs ?? []).filter(j => j.status === "oplacone" || j.status === "zakonczone").reduce((s, j) => s + Number(j.revenue), 0);

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold" style={{ color: "hsl(210 40% 98%)" }}>{customer.full_name}</h2>
        <Button size="sm" variant="destructive" onClick={deleteCustomer}><Trash2 size={14} /></Button>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        {customer.phone && (
          <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm" style={{ color: "hsl(217 91% 60%)" }}>
            <Phone size={15}/>{customer.phone}
          </a>
        )}
        {customer.email && (
          <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm" style={{ color: "hsl(217 91% 60%)" }}>
            <Mail size={15}/>{customer.email}
          </a>
        )}
        {(customer.address || customer.city) && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(215 20% 65%)" }}>
            <MapPin size={15} style={{ color: "hsl(215 20% 45%)" }}/>{[customer.address, customer.city].filter(Boolean).join(", ")}
          </div>
        )}
        {customer.notes && (
          <p className="text-xs pt-2 border-t italic" style={{ borderColor: "hsl(217 33% 15%)", color: "hsl(215 20% 45%)" }}>
            {customer.notes}
          </p>
        )}
      </div>

      <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "hsl(215 20% 55%)" }}>ŁĄCZNY PRZYCHÓD</p>
        <p className="text-2xl font-bold" style={{ color: "hsl(142 76% 46%)" }}>{formatPLN(totalRevenue)}</p>
        <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 45%)" }}>{customer.jobs?.length ?? 0} zleceń łącznie</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm" style={{ color: "hsl(210 40% 98%)" }}>Historia zleceń</h3>
          <Link href="/jobs/new"><Button size="sm" variant="outline"><Briefcase size={13}/> Nowe</Button></Link>
        </div>
        <div className="space-y-2">
          {(customer.jobs ?? []).length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "hsl(215 20% 45%)" }}>Brak zleceń</p>
          ) : (
            (customer.jobs ?? []).map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div
                  className="rounded-xl border px-4 py-3 transition-colors active:opacity-80"
                  style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium flex-1 truncate" style={{ color: "hsl(210 40% 98%)" }}>{job.title}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {job.scheduled_at && (
                      <span className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{formatDate(job.scheduled_at)}</span>
                    )}
                    {job.revenue > 0 && (
                      <span className="text-xs font-semibold" style={{ color: "hsl(142 76% 46%)" }}>{formatPLN(Number(job.revenue))}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
