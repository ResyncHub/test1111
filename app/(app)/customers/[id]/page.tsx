"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Customer, Job } from "@/types";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPLN } from "@/lib/utils";
import { Phone, Mail, MapPin, Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type CustomerWithJobs = Customer & { jobs: Job[] };

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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

  if (loading) return <div className="py-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  if (!customer) return <div className="py-16 text-center text-gray-400">Nie znaleziono klienta</div>;

  const totalRevenue = (customer.jobs ?? []).filter(j => j.status === "oplacone" || j.status === "zakonczone").reduce((s, j) => s + Number(j.revenue), 0);

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-900">{customer.full_name}</h2>
        <Button size="sm" variant="destructive" onClick={deleteCustomer}><Trash2 size={14} /></Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        {customer.phone && <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-primary"><Phone size={15}/>{customer.phone}</a>}
        {customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-primary"><Mail size={15}/>{customer.email}</a>}
        {(customer.address || customer.city) && (
          <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={15} className="text-gray-400"/>{[customer.address, customer.city].filter(Boolean).join(", ")}</div>
        )}
        {customer.notes && <p className="text-xs text-gray-400 pt-2 border-t border-gray-100 italic">{customer.notes}</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-1">ŁĄCZNY PRZYCHÓD</p>
        <p className="text-2xl font-bold text-emerald-600">{formatPLN(totalRevenue)}</p>
        <p className="text-xs text-gray-400">{customer.jobs?.length ?? 0} zleceń łącznie</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">Historia zleceń</h3>
          <Link href={`/jobs/new`}><Button size="sm" variant="outline"><Briefcase size={13}/> Nowe</Button></Link>
        </div>
        <div className="space-y-2">
          {(customer.jobs ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Brak zleceń</p>
          ) : (
            (customer.jobs ?? []).map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 active:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 flex-1 truncate">{job.title}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {job.scheduled_at && <span className="text-xs text-gray-400">{formatDate(job.scheduled_at)}</span>}
                    {job.revenue > 0 && <span className="text-xs font-semibold text-emerald-600">{formatPLN(Number(job.revenue))}</span>}
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
