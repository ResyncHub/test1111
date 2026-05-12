import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<string, React.CSSProperties> = {
  default:     { background: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" },
  secondary:   { background: "hsl(217 33% 12%)", color: "hsl(210 40% 98%)" },
  outline:     { background: "transparent", borderColor: "hsl(217 33% 18%)", color: "hsl(210 40% 98%)" },
  ghost:       { background: "transparent", color: "hsl(210 40% 98%)" },
  destructive: { background: "hsl(0 72% 51%)", color: "white" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", style, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-95 border border-transparent";
    const sizes = { sm: "text-xs px-3 py-1.5 gap-1.5", md: "text-sm px-4 py-2 gap-2", lg: "text-base px-5 py-2.5 gap-2" };
    return <button ref={ref} className={cn(base, sizes[size], className)} style={{ ...variantStyles[variant], ...style }} {...props} />;
  }
);
Button.displayName = "Button";
