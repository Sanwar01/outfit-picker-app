import type { ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

const NEUTRALS = new Set([
  "black",
  "white",
  "grey",
  "gray",
  "navy",
  "beige",
  "cream",
  "brown",
  "tan",
  "denim",
  "khaki",
  "charcoal",
  "olive",
]);

const STYLE_FORMALITY_TARGETS: Record<string, number> = {
  minimal: 3,
  streetwear: 2.5,
  "smart casual": 3.5,
  sporty: 2,
  classic: 3.5,
  bold: 3,
};

export const CANDIDATES_PER_SLOT = 4;
export const ACCESSORY_SCORE_THRESHOLD = 55;
export const SHUFFLE_ITEM_PENALTY = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeColor(color: string): string {
  return color.trim().toLowerCase();
}

function daysSince(isoDate: string | null): number {
  if (!isoDate) return 999;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isPatterned(item: ClothingItem): boolean {
  const pattern = item.pattern?.toLowerCase() ?? "solid";
  return pattern !== "solid" && pattern !== "plain" && pattern !== "none";
}

export function needsOuterwear(weather: WeatherSnapshot): boolean {
  return (
    weather.temp_c < 14 ||
    weather.precip_chance >= 40 ||
    ["rain", "drizzle", "storm"].includes(weather.condition)
  );
}

function isRainy(weather: WeatherSnapshot): boolean {
  return (
    weather.precip_chance >= 40 ||
    ["rain", "drizzle", "storm"].includes(weather.condition)
  );
}

function buildExcludeKey(itemIds: string[]): string {
  return [...itemIds].sort().join(",");
}

export function isExcludedCombination(
  itemIds: string[],
  excludeCombinations: string[][]
): boolean {
  const key = buildExcludeKey(itemIds);
  return excludeCombinations.some((combo) => buildExcludeKey(combo) === key);
}

export function itemFreshnessScore(item: ClothingItem): number {
  return Math.min(daysSince(item.last_worn_at) / 14, 1) * 100;
}

export function comboFreshnessScore(items: ClothingItem[]): number {
  if (items.length === 0) return 0;
  return (
    items.reduce((sum, item) => sum + itemFreshnessScore(item), 0) /
    items.length
  );
}

export function formalityCohesionScore(items: ClothingItem[]): number {
  const formalities = items.map((item) => item.formality);
  const spread = Math.max(...formalities) - Math.min(...formalities);
  return clamp(100 - spread * 20, 0, 100);
}

export function colorHarmonyScore(items: ClothingItem[]): number {
  let score = 50;

  const neutralCount = items.filter((item) =>
    item.colors.some((color) => NEUTRALS.has(normalizeColor(color)))
  ).length;
  score += Math.min(neutralCount * 15, 45);

  if (items.length >= 2) {
    const colorSets = items.map(
      (item) => new Set(item.colors.map(normalizeColor))
    );
    const [first, ...rest] = colorSets;
    const shared = [...first].filter((color) =>
      rest.every((set) => set.has(color))
    );
    score += shared.length * 20;
  }

  if (items.filter(isPatterned).length >= 2) {
    score -= 25;
  }

  const shoes = items.find((item) => item.category === "shoes");
  if (shoes) {
    const shoeColors = new Set(shoes.colors.map(normalizeColor));
    const matchesShoes = items
      .filter((item) => item.category !== "shoes")
      .some((item) =>
        item.colors.some((color) => shoeColors.has(normalizeColor(color)))
      );
    if (matchesShoes) score += 15;
  }

  return clamp(score, 0, 100);
}

export function weatherFitScore(
  items: ClothingItem[],
  weather: WeatherSnapshot
): number {
  let score = 70;
  const outerwear = items.some((item) => item.category === "outerwear");
  const wantsOuterwear = needsOuterwear(weather);

  if (wantsOuterwear && outerwear) score += 20;
  if (!wantsOuterwear && outerwear) score -= 20;

  const shoes = items.find((item) => item.category === "shoes");
  if (shoes && isRainy(weather)) {
    const name = shoes.name.toLowerCase();
    if (
      name.includes("boot") ||
      name.includes("leather") ||
      name.includes("waterproof")
    ) {
      score += 15;
    }
  }

  if (weather.temp_c > 26 && outerwear) {
    score -= 30;
  }

  return clamp(score, 0, 100);
}

export function styleVibeScore(
  items: ClothingItem[],
  styleVibes: string[]
): number {
  if (styleVibes.length === 0 || items.length === 0) return 70;

  const avgFormality =
    items.reduce((sum, item) => sum + item.formality, 0) / items.length;

  const targets = styleVibes
    .map((vibe) => STYLE_FORMALITY_TARGETS[vibe.toLowerCase()])
    .filter((value): value is number => value !== undefined);

  if (targets.length === 0) return 70;

  const target =
    targets.reduce((sum, value) => sum + value, 0) / targets.length;
  const distance = Math.abs(avgFormality - target);

  return clamp(100 - distance * 25, 0, 100);
}

export function shufflePenalty(
  items: ClothingItem[],
  excludeCombinations: string[][]
): number {
  const ids = items.map((item) => item.id);
  if (isExcludedCombination(ids, excludeCombinations)) {
    return Infinity;
  }

  let penalty = 0;
  for (const combo of excludeCombinations) {
    for (const item of items) {
      if (combo.includes(item.id)) {
        penalty += SHUFFLE_ITEM_PENALTY;
      }
    }
  }
  return penalty;
}

export function scoreOutfitCombo(
  items: ClothingItem[],
  weather: WeatherSnapshot,
  excludeCombinations: string[][],
  styleVibes: string[] = []
): number {
  const penalty = shufflePenalty(items, excludeCombinations);
  if (penalty === Infinity) return -Infinity;

  return (
    comboFreshnessScore(items) * 0.25 +
    formalityCohesionScore(items) * 0.25 +
    colorHarmonyScore(items) * 0.3 +
    weatherFitScore(items, weather) * 0.15 +
    styleVibeScore(items, styleVibes) * 0.05 -
    penalty
  );
}

export function accessoryFitScore(
  core: ClothingItem[],
  accessory: ClothingItem
): number {
  const combo = [...core, accessory];
  return (
    colorHarmonyScore(combo) * 0.6 + formalityCohesionScore(combo) * 0.4
  );
}

export function rankCandidates(
  items: ClothingItem[],
  excludeCombinations: string[][],
  options: { deprioritizeId?: string } = {}
): ClothingItem[] {
  const recentUse = new Map<string, number>();

  for (const combo of excludeCombinations) {
    for (const id of combo) {
      recentUse.set(id, (recentUse.get(id) ?? 0) + 1);
    }
  }

  return [...items].sort((a, b) => {
    if (options.deprioritizeId) {
      if (a.id === options.deprioritizeId) return 1;
      if (b.id === options.deprioritizeId) return -1;
    }

    const aRecent = recentUse.get(a.id) ?? 0;
    const bRecent = recentUse.get(b.id) ?? 0;
    if (aRecent !== bRecent) return aRecent - bRecent;

    const aFresh = daysSince(a.last_worn_at);
    const bFresh = daysSince(b.last_worn_at);
    if (aFresh !== bFresh) return bFresh - aFresh;

    return (a.wear_count ?? 0) - (b.wear_count ?? 0);
  });
}

export function buildLocalRationale(
  items: ClothingItem[],
  weather: WeatherSnapshot
): string {
  const top = items.find((item) => item.category === "top");
  const bottom = items.find((item) => item.category === "bottom");
  const avgFormality =
    items.reduce((sum, item) => sum + item.formality, 0) / items.length;

  const tempLabel =
    weather.temp_c < 12 ? "cool" : weather.temp_c > 24 ? "warm" : "mild";
  const formalityLabel =
    avgFormality >= 4 ? "Polished" : avgFormality <= 2 ? "Relaxed" : "Balanced";

  let rationale = `${formalityLabel} ${tempLabel}-weather look`;

  if (top && bottom) {
    rationale += ` with ${top.name.toLowerCase()} and ${bottom.name.toLowerCase()}`;
  }

  if (items.some((item) => item.category === "outerwear")) {
    rationale += ", layered for the forecast";
  }

  if (items.some((item) => item.category === "accessory")) {
    rationale += ", finished with an accessory";
  }

  const sharedNeutrals = items.some((item) =>
    item.colors.some((color) => NEUTRALS.has(normalizeColor(color)))
  );
  if (sharedNeutrals) {
    rationale += ". Neutral tones keep it cohesive";
  } else {
    rationale += ". Colors are balanced across the pieces";
  }

  return `${rationale}.`;
}
