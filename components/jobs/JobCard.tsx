import Link from "next/link";
import { Job } from "@/types";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatPLN } from "@/lib/utils";
import { Calendar, MapPin, User } from "lucide-react";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">{job.title}</h3>
          <StatusBadge status={job.status} />
        </div>

        <div className="space-y-1">
          {job.customer && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User size={12} /> <span>{job.customer.full_name}</span>
            </div>
          )}
          {job.scheduled_at && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} /> <span>{formatDate(job.scheduled_at)}</span>
            </div>
          )}
          {job.address && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} /> <span className="truncate">{job.address}</span>
            </div>
          )}
        </div>

        {job.revenue > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs font-semibold text-emerald-600">
            {formatPLN(job.revenue)}
          </div>
        )}
      </div>
    </Link>
  );
}
