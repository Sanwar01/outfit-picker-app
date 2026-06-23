import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 pb-28">
      <main className="mx-auto max-w-lg">{children}</main>
      <BottomNav />
    </div>
  );
}
