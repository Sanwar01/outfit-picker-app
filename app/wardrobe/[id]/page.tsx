import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ClothingItemDetail } from "@/components/wardrobe/clothing-item-detail";
import { getItemDetailExtras } from "@/lib/wardrobe/item-detail-data";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
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

  const { data: item } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!item) {
    notFound();
  }

  const clothingItem = item as ClothingItem;
  const extras = await getItemDetailExtras(supabase, clothingItem);

  return (
    <AppShell>
      <div className="px-4 py-5">
        <ClothingItemDetail
          item={clothingItem}
          galleryUrls={extras.galleryUrls}
          companions={extras.companions}
          outfitCount={extras.outfitCount}
          userId={userId}
        />
      </div>
    </AppShell>
  );
}
