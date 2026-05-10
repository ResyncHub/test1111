import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatRelative } from "date-fns";
import { pl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPLN(amount: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "d MMM yyyy", { locale: pl });
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "d MMM yyyy, HH:mm", { locale: pl });
}

export function formatRelativeDate(date: string | Date) {
  return formatRelative(new Date(date), new Date(), { locale: pl });
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  nowe: "Nowe",
  w_trakcie: "W trakcie",
  zakonczone: "Zakończone",
  oplacone: "Opłacone",
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  nowe: "bg-blue-100 text-blue-800",
  w_trakcie: "bg-amber-100 text-amber-800",
  zakonczone: "bg-emerald-100 text-emerald-800",
  oplacone: "bg-violet-100 text-violet-800",
};
