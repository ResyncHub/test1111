import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const inputStyle: React.CSSProperties = {
  background: "hsl(217 33% 9%)",
  borderColor: "hsl(217 33% 18%)",
  color: "hsl(210 40% 98%)",
};

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2.5 border rounded-lg text-sm transition-all",
        "focus:outline-none focus:ring-2 focus:border-transparent",
        "disabled:opacity-50 placeholder:opacity-40",
        className
      )}
      style={{ ...inputStyle, ...(props.style ?? {}) }}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-3 py-2.5 border rounded-lg text-sm resize-none transition-all",
        "focus:outline-none focus:ring-2 focus:border-transparent",
        "placeholder:opacity-40",
        className
      )}
      style={{ ...inputStyle, ...(props.style ?? {}) }}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium mb-1.5 uppercase tracking-wide", className)}
      style={{ color: "hsl(215 20% 55%)" }}
      {...props}
    />
  );
}
