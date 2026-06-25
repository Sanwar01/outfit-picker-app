import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitDetail } from "@/components/outfits/outfit-detail";
import { getSavedOutfitById } from "@/lib/outfits/get-outfit";

export const dynamic = "force-dynamic";

export default async function OutfitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;
  const outfit = await getSavedOutfitById(supabase, userId, id);

  if (!outfit) {
    notFound();
  }

  return (
    <AppShell>
      <div className="px-4 py-5">
        <OutfitDetail outfit={outfit} />
      </div>
    </AppShell>
  );
}
