import { getSignedImageUrls } from "@/lib/storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClothingItem } from "@/lib/types/database";

export interface StyleCompanion {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ItemDetailExtras {
  galleryUrls: string[];
  companions: StyleCompanion[];
  outfitCount: number;
}

export async function getItemGalleryUrls(
  supabase: SupabaseClient,
  item: ClothingItem
): Promise<string[]> {
  const { data: extraImages } = await supabase
    .from("clothing_item_images")
    .select("image_url")
    .eq("clothing_item_id", item.id)
    .order("sort_order", { ascending: true });

  const paths = [item.image_url];
  for (const row of extraImages ?? []) {
    if (!paths.includes(row.image_url)) {
      paths.push(row.image_url);
    }
  }

  try {
    const signed = await getSignedImageUrls(paths);
    return paths.map((path) => signed[path] ?? "");
  } catch {
    return paths.map(() => "");
  }
}

export async function getItemStyleCompanions(
  supabase: SupabaseClient,
  itemId: string
): Promise<{ companions: StyleCompanion[]; outfitCount: number }> {
  const { data: outfitLinks } = await supabase
    .from("outfit_items")
    .select("outfit_id")
    .eq("clothing_item_id", itemId);

  const outfitIds = [
    ...new Set((outfitLinks ?? []).map((row) => row.outfit_id)),
  ];
  const outfitCount = outfitIds.length;

  if (outfitIds.length === 0) {
    return { companions: [], outfitCount: 0 };
  }

  const { data: relatedItems } = await supabase
    .from("outfit_items")
    .select("clothing_item_id")
    .in("outfit_id", outfitIds)
    .neq("clothing_item_id", itemId);

  const frequency = new Map<string, number>();
  for (const row of relatedItems ?? []) {
    frequency.set(
      row.clothing_item_id,
      (frequency.get(row.clothing_item_id) ?? 0) + 1
    );
  }

  const topIds = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  if (topIds.length === 0) {
    return { companions: [], outfitCount };
  }

  const { data: clothing } = await supabase
    .from("clothing_items")
    .select("id, name, image_url")
    .in("id", topIds);

  if (!clothing?.length) {
    return { companions: [], outfitCount };
  }

  const clothingById = new Map(clothing.map((row) => [row.id, row]));
  let signedUrls: Record<string, string> = {};

  try {
    signedUrls = await getSignedImageUrls(clothing.map((row) => row.image_url));
  } catch {
    // Dev without storage credentials
  }

  const companions = topIds
    .map((id) => clothingById.get(id))
    .filter((row): row is (typeof clothing)[number] => !!row)
    .map((row) => ({
      id: row.id,
      name: row.name,
      imageUrl: signedUrls[row.image_url] ?? "",
    }));

  return { companions, outfitCount };
}

export async function getItemDetailExtras(
  supabase: SupabaseClient,
  item: ClothingItem
): Promise<ItemDetailExtras> {
  const [galleryUrls, styling] = await Promise.all([
    getItemGalleryUrls(supabase, item),
    getItemStyleCompanions(supabase, item.id),
  ]);

  return {
    galleryUrls,
    companions: styling.companions,
    outfitCount: styling.outfitCount,
  };
}
