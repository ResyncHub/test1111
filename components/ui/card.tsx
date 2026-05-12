import { cn } from "@/lib/utils";

export function Card({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border shadow-none", className)}
      style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)", ...style }}
      {...props}
    />
  );
}

export function CardHeader({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 py-3 border-b", className)}
      style={{ borderColor: "hsl(217 33% 15%)", ...style }}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}

export function CardTitle({ className, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold text-sm", className)}
      style={{ color: "hsl(210 40% 98%)", ...style }}
      {...props}
    />
  );
}
