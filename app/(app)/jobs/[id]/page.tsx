"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Job } from "@/types";
import { JobStatusStepper } from "@/components/jobs/JobStatusBadge";
import { CostsList } from "@/components/jobs/CostsList";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPLN } from "@/lib/utils";
import { Calendar, MapPin, User, Phone, Edit, Trash2 } from "lucide-react";
import { PhotoUpload } from "@/components/jobs/PhotoUpload";
import { toast } from "sonner";
import Link from "next/link";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.json()).then(data => { setJob(data?.error ? null : data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    const res = await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) { const updated = await res.json(); setJob(updated); toast.success("Status zaktualizowany"); }
    else toast.error("Błąd aktualizacji");
  }

  async function deleteJob() {
    if (!confirm("Usunąć zlecenie?")) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Zlecenie usunięte"); router.push("/jobs"); }
    else toast.error("Błąd usuwania");
  }

  if (loading) return (
    <div className="py-8 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "hsl(217 33% 12%)" }} />
      ))}
    </div>
  );
  if (!job) return (
    <div className="py-16 text-center" style={{ color: "hsl(215 20% 45%)" }}>Nie znaleziono zlecenia</div>
  );

  const totalCosts = (job.costs ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const profit = Number(job.revenue) - totalCosts;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h2 className="text-lg font-bold leading-snug" style={{ color: "hsl(210 40% 98%)" }}>{job.title}</h2>
          {job.category && <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 45%)" }}>{job.category.name}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/jobs/${id}/edit`}>
            <Button size="sm" variant="outline"><Edit size={14} /></Button>
          </Link>
          <Button size="sm" variant="destructive" onClick={deleteJob}><Trash2 size={14} /></Button>
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(215 20% 55%)" }}>STATUS</p>
        <JobStatusStepper current={job.status} onChange={updateStatus} />
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        {job.customer && (
          <div className="flex items-center gap-2">
            <User size={16} className="shrink-0" style={{ color: "hsl(215 20% 45%)" }} />
            <div>
              <Link href={`/customers/${job.customer.id}`} className="text-sm font-medium" style={{ color: "hsl(217 91% 60%)" }}>
                {job.customer.full_name}
              </Link>
              {job.customer.phone && (
                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "hsl(215 20% 45%)" }}>
                  <Phone size={10}/>{job.customer.phone}
                </p>
              )}
            </div>
          </div>
        )}
        {job.scheduled_at && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="shrink-0" style={{ color: "hsl(215 20% 45%)" }} />
            <span className="text-sm" style={{ color: "hsl(210 40% 90%)" }}>{formatDateTime(job.scheduled_at)}</span>
          </div>
        )}
        {job.address && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="shrink-0" style={{ color: "hsl(215 20% 45%)" }} />
            <span className="text-sm" style={{ color: "hsl(210 40% 90%)" }}>{job.address}</span>
          </div>
        )}
        {job.description && (
          <p className="text-sm pt-2 border-t" style={{ borderColor: "hsl(217 33% 15%)", color: "hsl(215 20% 70%)" }}>
            {job.description}
          </p>
        )}
        {job.notes && (
          <p className="text-xs italic" style={{ color: "hsl(215 20% 45%)" }}>{job.notes}</p>
        )}
      </div>

      <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(215 20% 55%)" }}>FINANSE</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Przychód</p>
            <p className="text-sm font-bold" style={{ color: "hsl(142 76% 46%)" }}>{formatPLN(Number(job.revenue))}</p>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Koszty</p>
            <p className="text-sm font-bold" style={{ color: "hsl(0 72% 61%)" }}>{formatPLN(totalCosts)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Zysk</p>
            <p className="text-sm font-bold" style={{ color: profit >= 0 ? "hsl(217 91% 60%)" : "hsl(0 72% 61%)" }}>{formatPLN(profit)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <CostsList jobId={id} costs={job.costs ?? []} />
      </div>

      <div className="rounded-xl border p-4" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <PhotoUpload jobId={id} photos={job.photos ?? []} />
      </div>
    </div>
  );
}
