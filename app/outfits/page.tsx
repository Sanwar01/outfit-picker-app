import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitsList } from "@/components/outfits/outfits-list";

export const dynamic = "force-dynamic";

export default async function OutfitsPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const { itemId } = await searchParams;

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;

  return (
    <AppShell>
      <div className="px-4 py-6">
        <h1 className="mb-6 text-xl font-semibold text-stone-900">
          Saved outfits
        </h1>
        <OutfitsList itemId={itemId} userId={userId} />
      </div>
    </AppShell>
  );
}
