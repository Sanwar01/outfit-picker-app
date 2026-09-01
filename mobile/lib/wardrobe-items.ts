import { apiGet, apiPatch } from "@/lib/api";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import type { ClothingItem, ClothingStatus } from "@shared/types/database";
import type { FilterValue } from "@shared/types/clothing";
import { supabase } from "@/lib/supabase";

export async function fetchWardrobeItems(userId: string): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "archived"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ClothingItem[];
}

export async function createSignedWardrobeUrls(
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from("wardrobe-images")
    .createSignedUrls(paths, 3600);

  if (error) throw new Error(error.message);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) map[row.path] = row.signedUrl;
  }
  return map;
}

export async function getClothingItem(id: string) {
  return apiGet<ClothingDraftResponse>(`/api/clothing/${id}`);
}

type ClothingItemPatch = ClothingDraftPatch & {
  status?: ClothingStatus;
};

export async function updateClothingItem(id: string, patch: ClothingItemPatch) {
  return apiPatch<ClothingDraftResponse>(`/api/clothing/${id}`, patch);
}

export async function archiveClothingItem(id: string) {
  return apiPatch<ClothingDraftResponse>(`/api/clothing/${id}`, {
    status: "archived",
  });
}

export async function restoreClothingItem(id: string) {
  return apiPatch<ClothingDraftResponse>(`/api/clothing/${id}`, {
    status: "active",
  });
}

export type WardrobeLoadResult = {
  items: ClothingItem[];
  urls: Record<string, string>;
  draftCount: number;
};

export async function loadWardrobeScreenData(
  userId: string,
): Promise<WardrobeLoadResult> {
  const [items, draftResult] = await Promise.all([
    fetchWardrobeItems(userId),
    apiGet<{ total: number }>("/api/clothing/drafts"),
  ]);

  const paths = items.map((item) => item.image_url);
  const urls = await createSignedWardrobeUrls(paths);

  return {
    items,
    urls,
    draftCount: draftResult.ok ? draftResult.data.total : 0,
  };
}

export { type FilterValue };
