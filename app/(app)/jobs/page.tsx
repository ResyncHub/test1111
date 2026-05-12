"use client";

import { useEffect, useState } from "react";
import { Job, JobStatus } from "@/types";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { Plus } from "lucide-react";

const TABS: { label: string; value: JobStatus | "all" }[] = [
  { label: "Wszystkie", value: "all" },
  { label: "Nowe",      value: "nowe" },
  { label: "W trakcie", value: "w_trakcie" },
  { label: "Zakończone",value: "zakonczone" },
  { label: "Opłacone",  value: "oplacone" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<JobStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = tab === "all" ? "/api/jobs" : `/api/jobs?status=${tab}`;
    fetch(url).then(r => r.json()).then(data => { setJobs(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  }, [tab]);

  return (
    <div className="py-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-none">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
            style={tab === t.value ? {
              background: "hsl(217 91% 60%)",
              borderColor: "hsl(217 91% 60%)",
              color: "hsl(222 47% 5%)",
            } : {
              background: "transparent",
              borderColor: "hsl(217 33% 20%)",
              color: "hsl(215 20% 55%)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "hsl(217 33% 12%)" }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon="📋" title="Brak zleceń" description="Dodaj pierwsze zlecenie" />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/jobs/new"
        className="fixed right-4 bottom-24 z-40 rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        style={{ background: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" }}
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
