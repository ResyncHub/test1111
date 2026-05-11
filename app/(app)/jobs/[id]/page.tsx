"use client";

import { useEffect, useState, use } from "react";
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

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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

  if (loading) return <div className="py-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  if (!job) return <div className="py-16 text-center text-gray-400">Nie znaleziono zlecenia</div>;

  const totalCosts = (job.costs ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const profit = Number(job.revenue) - totalCosts;

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h2>
          {job.category && <p className="text-xs text-gray-400 mt-0.5">{job.category.name}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/jobs/${id}/edit`}>
            <Button size="sm" variant="outline"><Edit size={14} /></Button>
          </Link>
          <Button size="sm" variant="destructive" onClick={deleteJob}><Trash2 size={14} /></Button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">STATUS</p>
        <JobStatusStepper current={job.status} onChange={updateStatus} />
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {job.customer && (
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400 shrink-0" />
            <div>
              <Link href={`/customers/${job.customer.id}`} className="text-sm font-medium text-primary">{job.customer.full_name}</Link>
              {job.customer.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10}/>{job.customer.phone}</p>}
            </div>
          </div>
        )}
        {job.scheduled_at && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{formatDateTime(job.scheduled_at)}</span>
          </div>
        )}
        {job.address && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{job.address}</span>
          </div>
        )}
        {job.description && <p className="text-sm text-gray-600 pt-1 border-t border-gray-100">{job.description}</p>}
        {job.notes && <p className="text-xs text-gray-400 italic">{job.notes}</p>}
      </div>

      {/* Finanse */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">FINANSE</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-400">Przychód</p>
            <p className="text-sm font-bold text-emerald-600">{formatPLN(Number(job.revenue))}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Koszty</p>
            <p className="text-sm font-bold text-red-500">{formatPLN(totalCosts)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Zysk</p>
            <p className={`text-sm font-bold ${profit >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatPLN(profit)}</p>
          </div>
        </div>
      </div>

      {/* Koszty */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <CostsList jobId={id} costs={job.costs ?? []} />
      </div>

      {/* Zdjęcia */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <PhotoUpload jobId={id} photos={job.photos ?? []} />
      </div>
    </div>
  );
}
