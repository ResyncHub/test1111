import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="pt-14 pb-20 min-h-screen max-w-lg mx-auto px-4">
        {children}
      </main>
      <BottomNav />
      <Toaster richColors position="top-center" />
    </>
  );
}
