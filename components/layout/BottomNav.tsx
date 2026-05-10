"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Briefcase, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",          icon: Home,      label: "Dashboard" },
  { href: "/calendar",  icon: Calendar,  label: "Kalendarz" },
  { href: "/jobs",      icon: Briefcase, label: "Zlecenia"  },
  { href: "/customers", icon: Users,     label: "Klienci"   },
  { href: "/chat",      icon: Sparkles,  label: "Asystent"  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                active ? "text-primary" : "text-gray-400"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
