import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/query-client";
import { apiGet } from "@/services/api";
import { getSavedOutfit, listSavedOutfits } from "@/features/outfits/api";
import type { SavedOutfit } from "@shared/types/outfit";

const OUTFITS_STALE_MS = 5 * 60 * 1000;

async function fetchSavedOutfitsList(): Promise<SavedOutfit[]> {
  const result = await listSavedOutfits();
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function useSavedOutfitsQuery() {
  return useQuery({
    queryKey: queryKeys.outfits.list(),
    queryFn: fetchSavedOutfitsList,
    staleTime: OUTFITS_STALE_MS,
  });
}

async function fetchSavedOutfit(id: string): Promise<SavedOutfit> {
  const result = await getSavedOutfit(id);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function useSavedOutfitQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.outfits.detail(id),
    queryFn: () => fetchSavedOutfit(id!),
    enabled: Boolean(id),
    staleTime: OUTFITS_STALE_MS,
  });
}

export function useOutfitsByItemCountQuery(itemId?: string) {
  return useQuery({
    queryKey: queryKeys.outfits.byItem(itemId),
    queryFn: async (): Promise<number> => {
      const result = await apiGet<SavedOutfit[]>(
        `/api/outfits?itemId=${encodeURIComponent(itemId!)}`,
      );
      if (!result.ok) throw new Error(result.error);
      return result.data.length;
    },
    enabled: Boolean(itemId),
    staleTime: OUTFITS_STALE_MS,
  });
}
