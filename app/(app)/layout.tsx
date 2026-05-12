import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "hsl(222 47% 5%)" }}>
      <TopBar />
      <main className="pt-14 pb-20 min-h-screen max-w-lg mx-auto px-4">
        {children}
      </main>
      <BottomNav />
      <Toaster theme="dark" richColors position="top-center" />
    </div>
  );
}
