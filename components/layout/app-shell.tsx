import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <main className="mx-auto max-w-lg">{children}</main>
      <BottomNav />
    </div>
  );
}
