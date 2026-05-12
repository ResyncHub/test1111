"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Settings } from "lucide-react";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/":               "Dashboard",
  "/calendar":       "Kalendarz",
  "/jobs":           "Zlecenia",
  "/jobs/new":       "Nowe zlecenie",
  "/customers":      "Klienci",
  "/customers/new":  "Nowy klient",
  "/chat":           "Asystent",
  "/finance":        "Finanse",
  "/settings":       "Ustawienia",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isRoot = Object.keys(PAGE_TITLES).includes(pathname);
  const title = PAGE_TITLES[pathname] ?? "Mózg Serwisowy";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b pt-safe"
      style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {!isRoot ? (
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "hsl(215 20% 55%)" }}
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "hsl(217 91% 60%)" }}
          >
            <span className="text-xs font-bold" style={{ color: "hsl(222 47% 5%)" }}>MS</span>
          </div>
        )}

        <h1 className="text-sm font-semibold" style={{ color: "hsl(210 40% 98%)" }}>{title}</h1>

        <Link
          href="/settings"
          className="p-1 -mr-1 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: "hsl(215 20% 55%)" }}
        >
          <Settings size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
}
