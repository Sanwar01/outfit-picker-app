import { itemWeatherSuitability } from "@/lib/ai/weather-suitability";
import type { ClothingItem } from "@/lib/types/database";
import type { OccasionId } from "@/lib/today/occasions";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function styleTagOverlap(
  styleTags: string[],
  styleVibes: string[],
): number {
  if (styleVibes.length === 0) return 0.5;
  if (styleTags.length === 0) return 0.4;

  const vibes = styleVibes.map(normalizeTag);
  const tags = styleTags.map(normalizeTag);

  let matches = 0;
  for (const tag of tags) {
    if (
      vibes.some(
        (vibe) => tag === vibe || tag.includes(vibe) || vibe.includes(tag),
      )
    ) {
      matches += 1;
    }
  }
  return Math.min(matches / Math.max(vibes.length, 1), 1);
}

export function itemOccasionMatch(
  item: ClothingItem,
  occasionId: OccasionId,
): number {
  if (occasionId === "auto") return 0.5;
  if (!item.occasions?.length) return 0.4;
  if (item.occasions.includes(occasionId)) return 1;
  return 0.15;
}

function targetWarmth(weather: WeatherSnapshot): number {
  if (weather.temp_c < 8) return 4.5;
  if (weather.temp_c < 12) return 4;
  if (weather.temp_c < 16) return 3;
  if (weather.temp_c > 28) return 1;
  if (weather.temp_c > 24) return 1.5;
  if (weather.temp_c > 20) return 2;
  return 2.5;
}

export function itemWarmthFit(
  item: ClothingItem,
  weather: WeatherSnapshot,
): number {
  if (item.warmth == null) return 0.5;

  const target = targetWarmth(weather);
  const distance = Math.abs(item.warmth - target);
  const categoryWeight =
    item.category === "outerwear"
      ? 1.5
      : item.category === "top"
        ? 1.2
        : item.category === "bottom"
          ? 0.8
          : 0.5;

  return Math.max(0, Math.min(1, 1 - (distance / 4) * categoryWeight));
}

function currentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export function itemSeasonFit(item: ClothingItem): number {
  if (!item.season?.length) return 0.5;

  const season = currentSeason();
  if (
    item.season.some((s) => {
      const normalized = normalizeTag(s);
      return normalized.includes("all-season") || normalized.includes("all season");
    })
  ) {
    return 0.85;
  }
  if (item.season.some((s) => normalizeTag(s).includes(season))) return 1;
  return 0.3;
}

export function itemRelevanceScore(
  item: ClothingItem,
  context: {
    styleVibes: string[];
    occasionId: OccasionId;
    weather: WeatherSnapshot;
  },
): number {
  const style = styleTagOverlap(item.style_tags ?? [], context.styleVibes);
  const occasion = itemOccasionMatch(item, context.occasionId);
  const weatherSuit = itemWeatherSuitability(item, context.weather) / 100;
  const warmth = itemWarmthFit(item, context.weather);
  const season = itemSeasonFit(item);

  if (context.occasionId === "auto") {
    return weatherSuit * 0.45 + warmth * 0.2 + season * 0.15 + style * 0.12 + occasion * 0.08;
  }

  return style * 0.3 + occasion * 0.25 + weatherSuit * 0.25 + warmth * 0.12 + season * 0.08;
}

function daysSince(isoDate: string | null): number {
  if (!isoDate) return 999;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function rankWardrobeForGeneration(
  items: ClothingItem[],
  context: {
    styleVibes: string[];
    occasionId: OccasionId;
    weather: WeatherSnapshot;
  },
): ClothingItem[] {
  const byCategory = new Map<string, ClothingItem[]>();

  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const ranked: ClothingItem[] = [];
  for (const list of byCategory.values()) {
    ranked.push(
      ...list.sort((a, b) => {
        const scoreDiff =
          itemRelevanceScore(b, context) - itemRelevanceScore(a, context);
        if (scoreDiff !== 0) return scoreDiff;

        const freshnessDiff =
          daysSince(a.last_worn_at) - daysSince(b.last_worn_at);
        if (freshnessDiff !== 0) return freshnessDiff;

        return (a.wear_count ?? 0) - (b.wear_count ?? 0);
      }),
    );
  }

  return ranked;
}
