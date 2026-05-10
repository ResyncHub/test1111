import { cn, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/lib/utils";

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", className)} {...props}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={JOB_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}>
      {JOB_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
