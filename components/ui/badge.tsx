import { cn, JOB_STATUS_LABELS } from "@/lib/utils";

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", className)} {...props}>{children}</span>;
}

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  nowe:       { background: "hsla(199,89%,48%,0.12)", color: "hsl(199 89% 58%)", border: "1px solid hsla(199,89%,48%,0.25)" },
  w_trakcie:  { background: "hsla(38,92%,50%,0.12)",  color: "hsl(38 92% 60%)",  border: "1px solid hsla(38,92%,50%,0.25)" },
  zakonczone: { background: "hsla(142,76%,36%,0.12)", color: "hsl(142 76% 46%)", border: "1px solid hsla(142,76%,36%,0.25)" },
  oplacone:   { background: "hsla(262,80%,60%,0.12)", color: "hsl(262 80% 70%)", border: "1px solid hsla(262,80%,60%,0.25)" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { background: "hsla(215,20%,55%,0.12)", color: "hsl(215 20% 65%)", border: "1px solid hsla(215,20%,55%,0.2)" };
  const label = JOB_STATUS_LABELS[status] ?? status;
  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={style}>{label}</span>;
}
