import type { ClothingItem } from "@/lib/types/database";
import type { OccasionId } from "@/lib/today/occasions";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { itemSeasonFit, itemWarmthFit } from "@/lib/ai/wardrobe-relevance";

/** Aligned with outerwear expectations in the rules engine. */
export const COLD_TEMP_C = 14;
export const HOT_TEMP_C = 26;
export const RAIN_PRECIP_THRESHOLD = 40;

/** Minimum suitability (0–100) to enter combo search pools. */
export const POOL_SUITABILITY_MIN = 50;

/** Minimum average suitability for a finished outfit to be accepted. */
export const OUTFIT_SUITABILITY_MIN = 45;

export function isRainy(weather: WeatherSnapshot): boolean {
  return (
    weather.precip_chance >= RAIN_PRECIP_THRESHOLD ||
    ["rain", "drizzle", "storm"].includes(weather.condition)
  );
}

export function isCold(weather: WeatherSnapshot): boolean {
  return weather.temp_c < COLD_TEMP_C;
}

export function isHot(weather: WeatherSnapshot): boolean {
  return weather.temp_c > HOT_TEMP_C;
}

export function needsOuterwear(weather: WeatherSnapshot): boolean {
  return isCold(weather) || isRainy(weather);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function itemText(item: ClothingItem): string {
  return normalizeText(
    [item.name, item.sub_category ?? "", item.material ?? ""].join(" "),
  );
}

export function isSummerItem(item: ClothingItem): boolean {
  const text = itemText(item);
  const sub = normalizeText(item.sub_category ?? "");

  if (item.warmth != null && item.warmth <= 2) return true;

  if (
    sub.includes("short") ||
    sub.includes("skirt") ||
    sub.includes("sandal") ||
    sub.includes("tank") ||
    sub.includes("vest") ||
    sub.includes("linen")
  ) {
    return true;
  }

  return (
    text.includes("shorts") ||
    text.includes("skirt") ||
    text.includes("sandal") ||
    text.includes("flip flop") ||
    text.includes("tank top") ||
    text.includes("crop top") ||
    text.includes("linen shirt") ||
    text.includes("swim")
  );
}

export function isWinterItem(item: ClothingItem): boolean {
  const text = itemText(item);
  const sub = normalizeText(item.sub_category ?? "");

  if (item.warmth != null && item.warmth >= 4) return true;

  if (
    sub.includes("coat") ||
    sub.includes("parka") ||
    sub.includes("boot") ||
    sub.includes("gilet")
  ) {
    return true;
  }

  return (
    text.includes("wool") ||
    text.includes("puffer") ||
    text.includes("parka") ||
    text.includes("boot")
  );
}

export function isRainFriendlyShoe(item: ClothingItem): boolean {
  const text = itemText(item);
  return (
    text.includes("boot") ||
    text.includes("leather") ||
    text.includes("waterproof") ||
    text.includes("rain boot")
  );
}

export function isRainUnfriendlyShoe(item: ClothingItem): boolean {
  if (item.category !== "shoes") return false;
  const text = itemText(item);
  return (
    text.includes("suede") ||
    text.includes("canvas") ||
    text.includes("sandal") ||
    text.includes("flip")
  );
}

export function isItemAllowedForWeather(
  item: ClothingItem,
  weather: WeatherSnapshot,
): boolean {
  if (item.status !== "active") return false;

  const cold = isCold(weather);
  const rainy = isRainy(weather);
  const hot = isHot(weather);
  const text = itemText(item);

  if ((cold || rainy) && isSummerItem(item)) return false;

  if (hot && item.category === "outerwear") {
    if (item.warmth != null && item.warmth >= 4) return false;
    if (
      text.includes("coat") ||
      text.includes("parka") ||
      text.includes("puffer")
    ) {
      return false;
    }
  }

  if (cold && item.category === "outerwear") {
    if (item.warmth != null && item.warmth <= 1) return false;
  }

  if ((cold || rainy) && item.category === "shoes") {
    if (text.includes("sandal") || text.includes("flip")) return false;
  }

  if (rainy && isRainUnfriendlyShoe(item)) return false;

  if (rainy && item.category === "bottom") {
    if (text.includes("linen") && !text.includes("lined")) return false;
  }

  return true;
}

export function itemWeatherSuitability(
  item: ClothingItem,
  weather: WeatherSnapshot,
): number {
  if (!isItemAllowedForWeather(item, weather)) return 0;

  let score = 72;

  const cold = isCold(weather);
  const rainy = isRainy(weather);
  const hot = isHot(weather);
  const text = itemText(item);

  score += (itemWarmthFit(item, weather) - 0.5) * 50;
  score += (itemSeasonFit(item) - 0.5) * 24;

  if (cold || rainy) {
    if (isWinterItem(item)) score += 12;
    if (isSummerItem(item)) score -= 45;
    if (item.category === "bottom" && text.includes("short")) score -= 50;
  }

  if (hot) {
    if (isSummerItem(item)) score += 10;
    if (isWinterItem(item)) score -= 18;
  }

  if (rainy) {
    if (item.category === "shoes") {
      score += isRainFriendlyShoe(item) ? 18 : -25;
    }
    if (item.category === "outerwear") {
      score += 8;
    }
  }

  if (needsOuterwear(weather) && item.category === "outerwear") {
    score += 10;
  }

  if (!needsOuterwear(weather) && item.category === "outerwear") {
    score -= 12;
  }

  return Math.max(0, Math.min(100, score));
}

export function outfitWeatherSuitability(
  items: ClothingItem[],
  weather: WeatherSnapshot,
): number {
  if (items.length === 0) return 0;

  const itemScores = items.map((item) => itemWeatherSuitability(item, weather));
  let score =
    itemScores.reduce((sum, value) => sum + value, 0) / itemScores.length;

  const wantsOuterwear = needsOuterwear(weather);
  const hasOuterwear = items.some((item) => item.category === "outerwear");
  if (wantsOuterwear && !hasOuterwear) score -= 22;
  if (!wantsOuterwear && hasOuterwear) score -= 10;

  if (isRainy(weather)) {
    const shoes = items.find((item) => item.category === "shoes");
    if (shoes && !isRainFriendlyShoe(shoes)) score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

export function outfitPassesWeatherCheck(
  items: ClothingItem[],
  weather: WeatherSnapshot,
  minScore = OUTFIT_SUITABILITY_MIN,
): boolean {
  if (items.some((item) => !isItemAllowedForWeather(item, weather))) {
    return false;
  }
  return outfitWeatherSuitability(items, weather) >= minScore;
}

export function filterItemsForWeatherPool(
  items: ClothingItem[],
  weather: WeatherSnapshot,
  minScore = POOL_SUITABILITY_MIN,
): ClothingItem[] {
  return items.filter(
    (item) => itemWeatherSuitability(item, weather) >= minScore,
  );
}

export function isWeatherFirstOccasion(occasionId?: OccasionId): boolean {
  return !occasionId || occasionId === "auto";
}

export function scoringWeights(occasionId?: OccasionId): {
  freshness: number;
  formality: number;
  color: number;
  weather: number;
  vibe: number;
} {
  if (isWeatherFirstOccasion(occasionId)) {
    return {
      freshness: 0.16,
      formality: 0.16,
      color: 0.2,
      weather: 0.32,
      vibe: 0.06,
    };
  }

  return {
    freshness: 0.2,
    formality: 0.2,
    color: 0.24,
    weather: 0.22,
    vibe: 0.08,
  };
}
