import type { ClothingCategory, ClothingItem } from "@/lib/types/database";

export type CoreOutfitSlot = "top" | "bottom" | "outerwear" | "shoes";

export interface OutfitSlots {
  top?: string;
  bottom?: string;
  outerwear?: string;
  shoes?: string;
  accessories?: string[];
}

export const CORE_SLOT_ORDER: CoreOutfitSlot[] = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
];

export function normalizeOutfitSlots(raw: unknown): OutfitSlots {
  if (!raw || typeof raw !== "object") return {};

  const value = raw as Record<string, unknown>;
  const accessories = Array.isArray(value.accessories)
    ? value.accessories.filter((id): id is string => typeof id === "string")
    : typeof value.accessory === "string"
      ? [value.accessory]
      : [];

  return {
    top: typeof value.top === "string" ? value.top : undefined,
    bottom: typeof value.bottom === "string" ? value.bottom : undefined,
    outerwear: typeof value.outerwear === "string" ? value.outerwear : undefined,
    shoes: typeof value.shoes === "string" ? value.shoes : undefined,
    accessories: accessories.length > 0 ? accessories : undefined,
  };
}

export function outfitSlotsToItemIds(slots: OutfitSlots): string[] {
  const ids = CORE_SLOT_ORDER.flatMap((slot) => {
    const id = slots[slot];
    return id ? [id] : [];
  });

  for (const id of slots.accessories ?? []) {
    if (!ids.includes(id)) ids.push(id);
  }

  return ids;
}

export function outfitSlotsHasItems(slots: OutfitSlots): boolean {
  return outfitSlotsToItemIds(slots).length > 0;
}

export function outfitSlotsToDbRows(
  outfitId: string,
  slots: OutfitSlots,
): Array<{
  outfit_id: string;
  clothing_item_id: string;
  slot: ClothingCategory;
}> {
  const rows: Array<{
    outfit_id: string;
    clothing_item_id: string;
    slot: ClothingCategory;
  }> = [];

  for (const slot of CORE_SLOT_ORDER) {
    const clothingItemId = slots[slot];
    if (clothingItemId) {
      rows.push({ outfit_id: outfitId, clothing_item_id: clothingItemId, slot });
    }
  }

  for (const clothingItemId of slots.accessories ?? []) {
    rows.push({
      outfit_id: outfitId,
      clothing_item_id: clothingItemId,
      slot: "accessory",
    });
  }

  return rows;
}

export function orderItemsBySlots(
  items: ClothingItem[],
  slots: OutfitSlots,
): ClothingItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = CORE_SLOT_ORDER.flatMap((slot) => {
    const id = slots[slot];
    if (!id) return [];
    const item = byId.get(id);
    return item ? [item] : [];
  });

  for (const id of slots.accessories ?? []) {
    const item = byId.get(id);
    if (item && !ordered.some((entry) => entry.id === item.id)) {
      ordered.push(item);
    }
  }

  for (const item of items) {
    if (!ordered.some((entry) => entry.id === item.id)) {
      ordered.push(item);
    }
  }

  return ordered;
}

export function itemsToOutfitSlots(items: ClothingItem[]): OutfitSlots {
  const slots: OutfitSlots = {};
  const accessories: string[] = [];

  for (const item of items) {
    if (item.category === "accessory") {
      accessories.push(item.id);
      continue;
    }

    if (
      item.category === "top" ||
      item.category === "bottom" ||
      item.category === "outerwear" ||
      item.category === "shoes"
    ) {
      slots[item.category] = item.id;
    }
  }

  if (accessories.length > 0) {
    slots.accessories = accessories;
  }

  return slots;
}
