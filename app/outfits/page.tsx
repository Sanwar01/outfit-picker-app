import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitsHub } from "@/components/outfits/outfits-hub";

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
      <div className="px-4 py-5">
        <OutfitsHub userId={userId} itemId={itemId} />
      </div>
    </AppShell>
  );
}
