import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { SavedOutfit } from "@shared/types/outfit";
import type { OutfitListFilter } from "@shared/outfits/outfit-display";

export async function listSavedOutfits(filter: OutfitListFilter = "all") {
  const query = filter === "favorites" ? "?favorites=true" : "";
  return apiGet<SavedOutfit[]>(`/api/outfits${query}`);
}

export async function getSavedOutfit(id: string) {
  return apiGet<SavedOutfit>(`/api/outfits/${id}`);
}

export async function updateSavedOutfit(
  id: string,
  patch: { is_favorite?: boolean; name?: string },
) {
  return apiPatch<{ id: string; name: string | null; is_favorite: boolean }>(
    `/api/outfits/${id}`,
    patch,
  );
}

export async function deleteSavedOutfit(id: string) {
  return apiDelete(`/api/outfits/${id}`);
}

export async function wearSavedOutfit(outfit: SavedOutfit) {
  return apiPost("/api/outfits/wear", {
    itemIds: outfit.items.map((item) => item.id),
    outfitId: outfit.id,
  });
}
