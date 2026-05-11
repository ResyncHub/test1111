"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import plLocale from "@fullcalendar/core/locales/pl";

const STATUS_COLORS: Record<string, string> = {
  nowe:       "#3b82f6",
  w_trakcie:  "#f59e0b",
  zakonczone: "#10b981",
  oplacone:   "#6366f1",
};

export default function CalendarPage() {
  const router = useRouter();

  return (
    <div className="py-2 -mx-4">
      <style>{`
        .fc { font-size: 13px; }
        .fc-toolbar-title { font-size: 15px !important; font-weight: 700; }
        .fc-button { padding: 4px 8px !important; font-size: 12px !important; }
        .fc-event { border-radius: 4px; border: none; padding: 1px 4px; font-size: 11px; }
        .fc-daygrid-event { white-space: nowrap; overflow: hidden; }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={plLocale}
        headerToolbar={{ left: "prev,next", center: "title", right: "dayGridMonth,timeGridWeek" }}
        events={async (info, success, failure) => {
          try {
            const res = await fetch(`/api/calendar?from=${info.startStr}&to=${info.endStr}`);
            const jobs = await res.json();
            success(Array.isArray(jobs) ? jobs.map((j: { id: string; title: string; status: string; scheduled_at: string; scheduled_end_at?: string; customer?: { full_name: string } }) => ({
              id: j.id,
              title: j.customer ? `${j.title} — ${j.customer.full_name}` : j.title,
              start: j.scheduled_at,
              end: j.scheduled_end_at ?? undefined,
              backgroundColor: STATUS_COLORS[j.status] ?? "#6b7280",
            })) : []);
          } catch {
            failure({ message: "Błąd ładowania kalendarza" });
          }
        }}
        eventClick={info => router.push(`/jobs/${info.event.id}`)}
        height="auto"
        contentHeight="auto"
      />
    </div>
  );
}
