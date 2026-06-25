import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/storage";
import { AppShell } from "@/components/layout/app-shell";
import { EditItemForm } from "@/components/wardrobe/edit-item-form";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
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

  const { data: extraImageRows } = await supabase
    .from("clothing_item_images")
    .select("id, image_url")
    .eq("clothing_item_id", id)
    .order("sort_order", { ascending: true });

  const imagePaths = [
    clothingItem.image_url,
    ...(extraImageRows ?? []).map((row) => row.image_url),
  ];

  let signedUrls: Record<string, string> = {};
  try {
    signedUrls = await getSignedImageUrls(imagePaths);
  } catch {
    // Dev without storage credentials
  }

  const extraImages = (extraImageRows ?? []).map((row) => ({
    id: row.id,
    imagePath: row.image_url,
    imageUrl: signedUrls[row.image_url] ?? "",
  }));

  return (
    <AppShell>
      <div className="px-4 py-5">
        <EditItemForm
          item={clothingItem}
          imageUrl={signedUrls[clothingItem.image_url] ?? ""}
          userId={userId}
          extraImages={extraImages}
        />
      </div>
    </AppShell>
  );
}
