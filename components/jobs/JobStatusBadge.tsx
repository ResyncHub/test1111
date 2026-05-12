import { StatusBadge } from "@/components/ui/badge";

const STATUS_ORDER = ["nowe", "w_trakcie", "zakonczone", "oplacone"];
const STATUS_LABELS: Record<string, string> = {
  nowe: "Nowe", w_trakcie: "W trakcie", zakonczone: "Zakończone", oplacone: "Opłacone",
};

export function JobStatusStepper({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_ORDER.map(s => {
        const isActive = s === current;
        return (
          <button key={s} onClick={() => onChange(s)} className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95"
            style={isActive ? { background: "hsl(217 91% 60%)", borderColor: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" }
              : { background: "transparent", borderColor: "hsl(217 33% 20%)", color: "hsl(215 20% 55%)" }}>
            {STATUS_LABELS[s] ?? s}
          </button>
        );
      })}
    </div>
  );
}

export { StatusBadge as JobStatusBadge };
