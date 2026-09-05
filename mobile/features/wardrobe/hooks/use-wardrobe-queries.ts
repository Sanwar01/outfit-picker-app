import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/query-client";
import {
  getClothingItem,
  loadWardrobeScreenData,
  type WardrobeLoadResult,
} from "@/features/wardrobe/api/items";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";

const WARDROBE_STALE_MS = 50 * 60 * 1000;

export function useWardrobeScreenQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.wardrobe.screen(userId),
    queryFn: (): Promise<WardrobeLoadResult> => loadWardrobeScreenData(userId!),
    enabled: Boolean(userId),
    staleTime: WARDROBE_STALE_MS,
  });
}

async function fetchClothingItem(id: string): Promise<ClothingDraftResponse> {
  const result = await getClothingItem(id);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function useClothingItemQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.wardrobe.item(id),
    queryFn: () => fetchClothingItem(id!),
    enabled: Boolean(id),
    staleTime: WARDROBE_STALE_MS,
  });
}
