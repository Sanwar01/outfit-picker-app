import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitsHub } from "@/components/outfits/outfits-hub";

export const dynamic = "force-dynamic";

export default async function OutfitsPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const { itemId, tab } = await searchParams;

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;
  const initialTab = tab === "favorites" ? "favorites" : "all";

  return (
    <AppShell>
      <div className="px-4 py-5">
        <OutfitsHub userId={userId} itemId={itemId} initialTab={initialTab} />
      </div>
    </AppShell>
  );
}
