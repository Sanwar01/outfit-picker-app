import type { ClothingCategory, ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import {
  CANDIDATES_PER_SLOT,
  needsOuterwear,
  pickAccessories,
  rankCandidates,
  scoreOutfitCombo,
} from "@/lib/ai/outfit-scoring";
import { rankWardrobeForGeneration } from "@/lib/ai/wardrobe-relevance";
import type { OutfitGenerationResult, OutfitSlot } from "@/lib/ai/outfit-rules";
import {
  outfitSlotsToItemIds,
  type OutfitSlots,
} from "@/lib/outfits/slots";
import {
  buildOutfitDescription,
  buildShortRationale,
} from "@/lib/today/descriptions";
import type { OccasionId } from "@/lib/today/occasions";
import { getOccasion } from "@/lib/today/occasions";

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
  styleVibes: string[],
  formalityTarget?: number,
  occasionId?: OccasionId,
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
          styleVibes,
          formalityTarget,
          occasionId,
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
  styleVibes: string[],
  formalityTarget?: number,
  occasionId?: OccasionId,
): ClothingItem | undefined {
  if (!needsOuterwear(weather) || candidates.length === 0) return undefined;

  let best: { item: ClothingItem; score: number } | undefined;
  for (const candidate of candidates) {
    const score = scoreOutfitCombo(
      [...core, candidate],
      weather,
      excludeCombinations,
      styleVibes,
      formalityTarget,
      occasionId,
    );
    if (!best || score > best.score) {
      best = { item: candidate, score };
    }
  }
  return best?.item;
}

export function generateOutfitLocally(input: {
  wardrobe: ClothingItem[];
  weather: WeatherSnapshot;
  excludeCombinations: string[][];
  styleVibes?: string[];
  occasionId: OccasionId;
}): OutfitGenerationResult {
  const styleVibes = input.styleVibes ?? [];
  const occasion = getOccasion(input.occasionId);
  const formalityTarget =
    input.occasionId === "auto" ? undefined : occasion.formalityTarget;
  const rankedWardrobe = rankWardrobeForGeneration(input.wardrobe, {
    styleVibes,
    occasionId: input.occasionId,
    weather: input.weather,
  });
  const byCategory = groupByCategory(rankedWardrobe);

  const rotateSlot =
    ROTATE_SLOTS[input.excludeCombinations.length % ROTATE_SLOTS.length];
  const deprioritizeId = getDeprioritizeId(
    rankedWardrobe,
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
    styleVibes,
    formalityTarget,
    input.occasionId,
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
      styleVibes,
      formalityTarget,
      input.occasionId,
    );
  }

  if (!bestCore) {
    return {
      item_ids: [],
      rationale: "Could not build an outfit from your wardrobe.",
      description: "Could not build an outfit from your wardrobe.",
      slots: {},
    };
  }

  const coreItems = [bestCore.top, bestCore.bottom, bestCore.shoes];
  const slots: OutfitSlots = {
    top: bestCore.top.id,
    bottom: bestCore.bottom.id,
    shoes: bestCore.shoes.id,
  };

  const outerwear = pickBestOuterwear(
    coreItems,
    pools.outerwear,
    input.weather,
    input.excludeCombinations,
    styleVibes,
    formalityTarget,
    input.occasionId,
  );
  if (outerwear) {
    slots.outerwear = outerwear.id;
  }

  const accessories = pickAccessories(
    outerwear ? [...coreItems, outerwear] : coreItems,
    pools.accessory,
  );
  if (accessories.length > 0) {
    slots.accessories = accessories.map((item) => item.id);
  }

  const selectedItems = [
    bestCore.top,
    bestCore.bottom,
    bestCore.shoes,
    ...(outerwear ? [outerwear] : []),
    ...accessories,
  ];

  const slotsRecord = Object.fromEntries(
    Object.entries(slots).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value,
    ),
  ) as Record<string, string | string[]>;

  return {
    item_ids: outfitSlotsToItemIds(slots),
    rationale: buildShortRationale(input.occasionId, input.weather),
    description: buildOutfitDescription(
      selectedItems,
      slotsRecord,
      input.occasionId,
      input.weather,
    ),
    slots,
  };
}
