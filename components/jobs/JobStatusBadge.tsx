import { StatusBadge } from "@/components/ui/badge";

const STATUS_ORDER = ["nowe", "w_trakcie", "zakonczone", "oplacone"];

export function JobStatusStepper({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {STATUS_ORDER.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            s === current
              ? "border-primary bg-primary text-white"
              : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
        >
          {s === "nowe" ? "Nowe" : s === "w_trakcie" ? "W trakcie" : s === "zakonczone" ? "Zakończone" : "Opłacone"}
        </button>
      ))}
    </div>
  );
}

export { StatusBadge as JobStatusBadge };
