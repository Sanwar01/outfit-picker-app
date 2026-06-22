import type { ClothingCategory, ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import {
  ACCESSORY_SCORE_THRESHOLD,
  CANDIDATES_PER_SLOT,
  accessoryFitScore,
  buildLocalRationale,
  needsOuterwear,
  rankCandidates,
  scoreOutfitCombo,
} from "@/lib/ai/outfit-scoring";
import type { OutfitGenerationResult, OutfitSlot } from "@/lib/ai/outfit-rules";

const ROTATE_SLOTS: OutfitSlot[] = ["top", "bottom", "shoes", "outerwear"];

interface CoreCombo {
  top: ClothingItem;
  bottom: ClothingItem;
  shoes: ClothingItem;
}

function groupByCategory(
  wardrobe: ClothingItem[]
): Map<ClothingCategory, ClothingItem[]> {
  const byCategory = new Map<ClothingCategory, ClothingItem[]>();
  for (const item of wardrobe) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  return byCategory;
}

function getDeprioritizeId(
  wardrobe: ClothingItem[],
  excludeCombinations: string[][],
  rotateSlot: OutfitSlot
): string | undefined {
  const lastCombo = excludeCombinations[excludeCombinations.length - 1];
  if (!lastCombo?.length) return undefined;

  const wardrobeById = new Map(wardrobe.map((item) => [item.id, item]));
  for (const id of lastCombo) {
    const item = wardrobeById.get(id);
    if (item?.category === rotateSlot) return id;
  }
  return undefined;
}

function buildCandidatePools(
  byCategory: Map<ClothingCategory, ClothingItem[]>,
  excludeCombinations: string[][],
  deprioritizeBySlot: Partial<Record<OutfitSlot, string>>
) {
  const pool = (slot: ClothingCategory) =>
    rankCandidates(byCategory.get(slot) ?? [], excludeCombinations, {
      deprioritizeId: deprioritizeBySlot[slot as OutfitSlot],
    }).slice(0, CANDIDATES_PER_SLOT);

  return {
    top: pool("top"),
    bottom: pool("bottom"),
    shoes: pool("shoes"),
    outerwear: pool("outerwear"),
    accessory: pool("accessory"),
  };
}

function enumerateCoreCombos(pools: {
  top: ClothingItem[];
  bottom: ClothingItem[];
  shoes: ClothingItem[];
}): CoreCombo[] {
  const combos: CoreCombo[] = [];
  for (const top of pools.top) {
    for (const bottom of pools.bottom) {
      for (const shoes of pools.shoes) {
        combos.push({ top, bottom, shoes });
      }
    }
  }
  return combos;
}

function pickBestCoreCombo(
  combos: CoreCombo[],
  weather: WeatherSnapshot,
  excludeCombinations: string[][],
  styleVibes: string[]
): CoreCombo | null {
  const scored = combos
    .map((combo) => {
      const items = [combo.top, combo.bottom, combo.shoes];
      return {
        combo,
        score: scoreOutfitCombo(
          items,
          weather,
          excludeCombinations,
          styleVibes
        ),
      };
    })
    .filter((entry) => entry.score > -Infinity)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const topTier = scored.slice(0, 3);
  const jittered = topTier.map((entry, index) => ({
    ...entry,
    jitterScore: entry.score + (Math.random() * 6 - 3) - index * 0.5,
  }));
  jittered.sort((a, b) => b.jitterScore - a.jitterScore);
  return jittered[0].combo;
}

function pickBestOuterwear(
  core: ClothingItem[],
  candidates: ClothingItem[],
  weather: WeatherSnapshot,
  excludeCombinations: string[][],
  styleVibes: string[]
): ClothingItem | undefined {
  if (!needsOuterwear(weather) || candidates.length === 0) return undefined;

  let best: { item: ClothingItem; score: number } | undefined;
  for (const candidate of candidates) {
    const score = scoreOutfitCombo(
      [...core, candidate],
      weather,
      excludeCombinations,
      styleVibes
    );
    if (!best || score > best.score) {
      best = { item: candidate, score };
    }
  }
  return best?.item;
}

function pickBestAccessory(
  core: ClothingItem[],
  candidates: ClothingItem[]
): ClothingItem | undefined {
  if (candidates.length === 0) return undefined;

  let best: { item: ClothingItem; score: number } | undefined;
  for (const candidate of candidates) {
    const score = accessoryFitScore(core, candidate);
    if (!best || score > best.score) {
      best = { item: candidate, score };
    }
  }

  if (best && best.score >= ACCESSORY_SCORE_THRESHOLD) {
    return best.item;
  }
  return undefined;
}

export function generateOutfitLocally(input: {
  wardrobe: ClothingItem[];
  weather: WeatherSnapshot;
  excludeCombinations: string[][];
  styleVibes?: string[];
}): OutfitGenerationResult {
  const styleVibes = input.styleVibes ?? [];
  const byCategory = groupByCategory(input.wardrobe);

  const rotateSlot =
    ROTATE_SLOTS[input.excludeCombinations.length % ROTATE_SLOTS.length];
  const deprioritizeId = getDeprioritizeId(
    input.wardrobe,
    input.excludeCombinations,
    rotateSlot
  );

  const deprioritizeBySlot: Partial<Record<OutfitSlot, string>> = {};
  if (deprioritizeId) {
    deprioritizeBySlot[rotateSlot] = deprioritizeId;
  }

  let pools = buildCandidatePools(
    byCategory,
    input.excludeCombinations,
    deprioritizeBySlot
  );

  let bestCore = pickBestCoreCombo(
    enumerateCoreCombos(pools),
    input.weather,
    input.excludeCombinations,
    styleVibes
  );

  if (!bestCore) {
    pools = buildCandidatePools(byCategory, input.excludeCombinations, {});
    const allTops = byCategory.get("top") ?? [];
    const allBottoms = byCategory.get("bottom") ?? [];
    const allShoes = byCategory.get("shoes") ?? [];

    bestCore = pickBestCoreCombo(
      enumerateCoreCombos({
        top: allTops,
        bottom: allBottoms,
        shoes: allShoes,
      }),
      input.weather,
      input.excludeCombinations,
      styleVibes
    );
  }

  if (!bestCore) {
    return {
      item_ids: [],
      rationale: "Could not build an outfit from your wardrobe.",
      slots: {},
    };
  }

  const coreItems = [bestCore.top, bestCore.bottom, bestCore.shoes];
  const slots: Partial<Record<OutfitSlot, string>> = {
    top: bestCore.top.id,
    bottom: bestCore.bottom.id,
    shoes: bestCore.shoes.id,
  };

  const outerwear = pickBestOuterwear(
    coreItems,
    pools.outerwear,
    input.weather,
    input.excludeCombinations,
    styleVibes
  );
  if (outerwear) {
    slots.outerwear = outerwear.id;
  }

  const accessory = pickBestAccessory(
    outerwear ? [...coreItems, outerwear] : coreItems,
    pools.accessory
  );
  if (accessory) {
    slots.accessory = accessory.id;
  }

  const selectedItems = [
    bestCore.top,
    bestCore.bottom,
    bestCore.shoes,
    ...(outerwear ? [outerwear] : []),
    ...(accessory ? [accessory] : []),
  ];

  return {
    item_ids: selectedItems.map((item) => item.id),
    rationale: buildLocalRationale(selectedItems, input.weather),
    slots,
  };
}
