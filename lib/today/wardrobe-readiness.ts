import {
  getMissingSlots,
  wardrobeHasMinimumItems,
  type OutfitSlot,
} from "@/lib/ai/outfit-rules";
import type { ClothingItem } from "@/lib/types/database";

export type WardrobeReadiness =
  | { status: "empty" }
  | { status: "partial"; missing: OutfitSlot[]; itemCount: number }
  | { status: "ready"; itemCount: number };

export function checkWardrobeReadiness(
  items: ClothingItem[]
): WardrobeReadiness {
  const active = items.filter((item) => item.status === "active");

  if (active.length === 0) {
    return { status: "empty" };
  }

  if (!wardrobeHasMinimumItems(active)) {
    return {
      status: "partial",
      missing: getMissingSlots(active),
      itemCount: active.length,
    };
  }

  return { status: "ready", itemCount: active.length };
}
