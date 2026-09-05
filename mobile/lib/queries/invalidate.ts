import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";

export function invalidateWardrobeQueries(
  queryClient: QueryClient,
  userId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all });
  if (userId) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.wardrobe.screen(userId),
    });
  }
}

export function invalidateClothingItemQuery(
  queryClient: QueryClient,
  id: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.item(id) });
}

export function invalidateOutfitsQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.outfits.all });
}

export function invalidateBillingUsage(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.billing.usage() });
}

export function invalidateSavedOutfitQuery(
  queryClient: QueryClient,
  id: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.outfits.detail(id) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.outfits.list() });
}
