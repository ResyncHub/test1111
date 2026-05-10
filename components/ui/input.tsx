import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-400",
        className
      )}
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
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white resize-none",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-gray-700 mb-1", className)} {...props} />;
}
