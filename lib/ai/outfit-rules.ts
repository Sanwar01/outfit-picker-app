import type { ClothingCategory, ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { rankWardrobeForGeneration } from "@/lib/ai/wardrobe-relevance";
import { isItemAllowedForWeather, filterItemsForWeatherPool } from "@/lib/ai/weather-suitability";
import type { OccasionId } from "@/lib/today/occasions";
import {
  itemsToOutfitSlots,
  normalizeOutfitSlots,
  outfitSlotsToItemIds,
  type OutfitSlots,
} from "@/lib/outfits/slots";
import { generateOutfitLocally } from "@/lib/ai/generate-outfit-local";
import {
  needsOuterwear,
  pickAccessories,
  rankCandidates,
  scoreOutfitCombo,
} from "@/lib/ai/outfit-scoring";

export { generateOutfitLocally };

export type OutfitSlot = "top" | "bottom" | "outerwear" | "shoes";

export interface OutfitGenerationResult {
  item_ids: string[];
  rationale: string;
  description: string;
  slots: OutfitSlots;
}

export interface WardrobeItemForAI {
  id: string;
  name: string;
  category: ClothingCategory;
  sub_category: string | null;
  colors: string[];
  formality: number;
  pattern: string;
  style_tags: string[];
  occasions: string[];
  warmth: number | null;
  season: string[];
  last_worn_at: string | null;
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
  weather: WeatherSnapshot,
): ClothingItem[] {
  return items.filter((item) => isItemAllowedForWeather(item, weather));
}

export function toWardrobeForAI(
  items: ClothingItem[],
  context?: {
    styleVibes: string[];
    occasionId: OccasionId;
    weather: WeatherSnapshot;
  },
): WardrobeItemForAI[] {
  const ordered = context
    ? rankWardrobeForGeneration(items, context)
    : [...items].sort(
        (a, b) => daysSince(a.last_worn_at) - daysSince(b.last_worn_at),
      );

  return ordered.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    sub_category: item.sub_category,
    colors: item.colors,
    formality: item.formality,
    pattern: item.pattern,
    style_tags: item.style_tags ?? [],
    occasions: item.occasions ?? [],
    warmth: item.warmth,
    season: item.season ?? [],
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
  weather?: WeatherSnapshot,
  occasionId: OccasionId = "auto",
): OutfitGenerationResult {
  const wardrobeById = new Map(wardrobe.map((i) => [i.id, i]));
  const byCategory = new Map<ClothingCategory, ClothingItem[]>();

  for (const item of wardrobe) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const slots = normalizeOutfitSlots(result.slots);
  const usedIds = new Set<string>();

  for (const id of result.item_ids) {
    const item = wardrobeById.get(id);
    if (item) {
      usedIds.add(id);
    }
  }

  Object.assign(slots, itemsToOutfitSlots(
    [...usedIds]
      .map((id) => wardrobeById.get(id))
      .filter((item): item is ClothingItem => !!item),
  ));

  for (const slot of REQUIRED_SLOTS) {
    if (!slots[slot]) {
      const pool = weather
        ? filterItemsForWeatherPool(byCategory.get(slot) ?? [], weather)
        : (byCategory.get(slot) ?? []);
      const candidates = rankCandidates(pool, [], {});
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
      filterItemsForWeatherPool(byCategory.get("outerwear") ?? [], weather),
      [],
      {},
    ).slice(0, 4);
    let best: { item: ClothingItem; score: number } | undefined;
    for (const candidate of candidates) {
      const score = scoreOutfitCombo(
        [...coreItems, candidate],
        weather,
        [],
        [],
        undefined,
        occasionId,
      );
      if (!best || score > best.score) best = { item: candidate, score };
    }
    if (best) {
      slots.outerwear = best.item.id;
      usedIds.add(best.item.id);
      selectedItems.push(best.item);
    }
  }

  const accessoryIds = new Set(slots.accessories ?? []);
  if (accessoryIds.size === 0 && byCategory.has("accessory")) {
    const currentCore = selectedItems.filter(
      (item) => item.category !== "accessory",
    );
    const picked = pickAccessories(
      currentCore,
      rankCandidates(byCategory.get("accessory") ?? [], [], {}).slice(0, 8),
    );
    if (picked.length > 0) {
      slots.accessories = picked.map((item) => item.id);
      for (const item of picked) {
        usedIds.add(item.id);
      }
    }
  }

  const item_ids = outfitSlotsToItemIds(slots);
  return {
    item_ids,
    rationale: result.rationale,
    description: result.description,
    slots,
  };
}
