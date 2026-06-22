import type { ClothingCategory, ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { generateOutfitLocally } from "@/lib/ai/generate-outfit-local";
import {
  accessoryFitScore,
  ACCESSORY_SCORE_THRESHOLD,
  needsOuterwear,
  rankCandidates,
  scoreOutfitCombo,
} from "@/lib/ai/outfit-scoring";

export { generateOutfitLocally };

export type OutfitSlot = "top" | "bottom" | "outerwear" | "shoes" | "accessory";

export interface WardrobeItemForAI {
  id: string;
  name: string;
  category: ClothingCategory;
  colors: string[];
  formality: number;
  pattern: string;
  last_worn_at: string | null;
}

export interface OutfitGenerationResult {
  item_ids: string[];
  rationale: string;
  description: string;
  slots: Partial<Record<OutfitSlot, string>>;
}

const REQUIRED_SLOTS: OutfitSlot[] = ["top", "bottom", "shoes"];

function daysSince(isoDate: string | null): number {
  if (!isoDate) return 999;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function wardrobeHasMinimumItems(items: ClothingItem[]): boolean {
  const categories = new Set(items.map((i) => i.category));
  return REQUIRED_SLOTS.every((slot) => categories.has(slot));
}

export function getMissingSlots(items: ClothingItem[]): OutfitSlot[] {
  const categories = new Set(items.map((i) => i.category));
  return REQUIRED_SLOTS.filter((slot) => !categories.has(slot));
}

export function filterWardrobeForWeather(
  items: ClothingItem[],
  weather: WeatherSnapshot
): ClothingItem[] {
  const isRainy =
    weather.precip_chance >= 40 ||
    ["rain", "drizzle", "storm"].includes(weather.condition);
  const isCold = weather.temp_c < 12;
  const isHot = weather.temp_c > 26;

  return items.filter((item) => {
    if (item.status !== "active") return false;

    const name = item.name.toLowerCase();
    const colors = item.colors.join(" ").toLowerCase();

    if (isRainy && item.category === "shoes") {
      if (
        name.includes("suede") ||
        name.includes("canvas") ||
        colors.includes("suede")
      ) {
        return false;
      }
    }

    if (isHot && item.category === "outerwear") {
      if (
        name.includes("coat") ||
        name.includes("jacket") ||
        name.includes("parka")
      ) {
        return false;
      }
    }

    if (isCold && item.category === "shoes") {
      if (name.includes("sandal") || name.includes("flip")) {
        return false;
      }
    }

    return true;
  });
}

export function toWardrobeForAI(items: ClothingItem[]): WardrobeItemForAI[] {
  return items
    .sort((a, b) => daysSince(a.last_worn_at) - daysSince(b.last_worn_at))
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      formality: item.formality,
      pattern: item.pattern,
      last_worn_at: item.last_worn_at,
    }));
}

export function validateOutfitSelection(
  itemIds: string[],
  wardrobe: ClothingItem[]
): boolean {
  const selected = wardrobe.filter((i) => itemIds.includes(i.id));
  const categories = new Set(selected.map((i) => i.category));
  return REQUIRED_SLOTS.every((slot) => categories.has(slot));
}

export function buildExcludeKey(itemIds: string[]): string {
  return [...itemIds].sort().join(",");
}

const MAX_ITEMS_PER_CATEGORY = 5;

export function compactWardrobeForAI(
  items: WardrobeItemForAI[]
): WardrobeItemForAI[] {
  const byCategory = new Map<ClothingCategory, WardrobeItemForAI[]>();

  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const compact: WardrobeItemForAI[] = [];
  for (const list of byCategory.values()) {
    compact.push(...list.slice(0, MAX_ITEMS_PER_CATEGORY));
  }

  return compact;
}

export function repairOutfitSelection(
  result: OutfitGenerationResult,
  wardrobe: ClothingItem[],
  weather?: WeatherSnapshot
): OutfitGenerationResult {
  const wardrobeById = new Map(wardrobe.map((i) => [i.id, i]));
  const byCategory = new Map<ClothingCategory, ClothingItem[]>();

  for (const item of wardrobe) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const slots: Partial<Record<OutfitSlot, string>> = { ...result.slots };
  const usedIds = new Set<string>();

  for (const id of result.item_ids) {
    const item = wardrobeById.get(id);
    if (item) {
      slots[item.category as OutfitSlot] = id;
      usedIds.add(id);
    }
  }

  for (const slot of REQUIRED_SLOTS) {
    if (!slots[slot]) {
      const candidates = rankCandidates(byCategory.get(slot) ?? [], [], {});
      const pick = candidates.find((item) => !usedIds.has(item.id));
      if (pick) {
        slots[slot] = pick.id;
        usedIds.add(pick.id);
      }
    }
  }

  const selectedItems = [...usedIds]
    .map((id) => wardrobeById.get(id))
    .filter((item): item is ClothingItem => !!item);

  const coreItems = selectedItems.filter((item) =>
    REQUIRED_SLOTS.includes(item.category as OutfitSlot)
  );

  if (
    weather &&
    needsOuterwear(weather) &&
    !slots.outerwear &&
    byCategory.has("outerwear")
  ) {
    const candidates = rankCandidates(
      byCategory.get("outerwear") ?? [],
      [],
      {}
    ).slice(0, 4);
    let best: { item: ClothingItem; score: number } | undefined;
    for (const candidate of candidates) {
      const score = scoreOutfitCombo(
        [...coreItems, candidate],
        weather,
        [],
        []
      );
      if (!best || score > best.score) best = { item: candidate, score };
    }
    if (best) {
      slots.outerwear = best.item.id;
      usedIds.add(best.item.id);
      selectedItems.push(best.item);
    }
  }

  if (!slots.accessory && byCategory.has("accessory")) {
    const currentCore = selectedItems.filter(
      (item) => item.category !== "accessory"
    );
    const candidates = rankCandidates(
      byCategory.get("accessory") ?? [],
      [],
      {}
    ).slice(0, 4);
    let best: { item: ClothingItem; score: number } | undefined;
    for (const candidate of candidates) {
      const score = accessoryFitScore(currentCore, candidate);
      if (!best || score > best.score) best = { item: candidate, score };
    }
    if (best && best.score >= ACCESSORY_SCORE_THRESHOLD) {
      slots.accessory = best.item.id;
      usedIds.add(best.item.id);
    }
  }

  const item_ids = [...usedIds];
  return {
    item_ids,
    rationale: result.rationale,
    description: result.description,
    slots,
  };
}
