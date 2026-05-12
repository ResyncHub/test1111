"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Briefcase, Users, Sparkles } from "lucide-react";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t pb-safe" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
      <div className="grid grid-cols-5 max-w-lg mx-auto h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-all duration-150"
              style={{ color: active ? "hsl(217 91% 60%)" : "hsl(215 20% 55%)" }}>
              <div className="flex items-center justify-center rounded-xl w-10 h-6 transition-all duration-150"
                style={{ background: active ? "hsla(217, 91%, 60%, 0.12)" : "transparent" }}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
