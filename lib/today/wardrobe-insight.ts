import type { ClothingItem } from "@/lib/types/database";

export interface WardrobeInsight {
  count: number;
  headline: string;
  detail: string;
}

export function getWardrobeInsight(
  items: ClothingItem[]
): WardrobeInsight | null {
  const active = items.filter((item) => item.status === "active");
  const unworn = active.filter(
    (item) => item.wear_count === 0 || item.last_worn_at == null
  );

  if (unworn.length < 2) return null;

  return {
    count: unworn.length,
    headline: "Wardrobe insight",
    detail: `You have ${unworn.length} pieces you haven't worn yet`,
  };
}
