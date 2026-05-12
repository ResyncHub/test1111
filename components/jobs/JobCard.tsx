import Link from "next/link";
import { Job } from "@/types";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatPLN } from "@/lib/utils";
import { Calendar, MapPin, User } from "lucide-react";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="rounded-xl border p-4 transition-colors active:opacity-80" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-snug flex-1" style={{ color: "hsl(210 40% 98%)" }}>{job.title}</h3>
          <StatusBadge status={job.status} />
        </div>
        <div className="space-y-1">
          {job.customer && <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(215 20% 55%)" }}><User size={12} /> <span>{job.customer.full_name}</span></div>}
          {job.scheduled_at && <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(215 20% 55%)" }}><Calendar size={12} /> <span>{formatDate(job.scheduled_at)}</span></div>}
          {job.address && <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(215 20% 55%)" }}><MapPin size={12} /> <span className="truncate">{job.address}</span></div>}
        </div>
        {job.revenue > 0 && <div className="mt-2 pt-2 border-t text-xs font-semibold" style={{ borderColor: "hsl(217 33% 18%)", color: "hsl(142 76% 46%)" }}>{formatPLN(job.revenue)}</div>}
      </div>
    </Link>
  );
}
