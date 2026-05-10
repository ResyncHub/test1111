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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 pt-safe">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {!isRoot ? (
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-500">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <span className="text-sm font-semibold text-primary">🔧</span>
        )}

        <h1 className="text-base font-semibold text-gray-900">{title}</h1>

        <Link href="/settings" className="p-1 -mr-1 text-gray-400">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
