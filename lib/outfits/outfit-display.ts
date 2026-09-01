import type { ClothingItem } from "@/lib/types/database";
import type { SavedOutfit } from "@/lib/types/outfit";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";
import { formatLastWorn } from "@/lib/wardrobe/wardrobe-display";

export type OutfitListFilter = "all" | "favorites";

export const OUTFIT_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "favorites", label: "Favourites" },
] as const;

export function filterSavedOutfits(
  outfits: SavedOutfit[],
  filter: OutfitListFilter,
): SavedOutfit[] {
  if (filter === "favorites") {
    return outfits.filter((outfit) => outfit.is_favorite);
  }
  return outfits;
}

export function outfitsSummaryLine(
  count: number,
  favoriteCount: number,
): string {
  if (count === 0) return "No saved outfits yet";
  const base = `${count} saved outfit${count === 1 ? "" : "s"}`;
  if (favoriteCount === 0) return base;
  return `${base} · ${favoriteCount} favourite${favoriteCount === 1 ? "" : "s"}`;
}

export function pickOutfitHeroItem(
  items: ClothingItem[],
): ClothingItem | undefined {
  const byCategory = new Map(items.map((item) => [item.category, item]));
  return (
    byCategory.get("outerwear") ??
    byCategory.get("top") ??
    byCategory.get("bottom") ??
    items[0]
  );
}

export function outfitCardSubtitle(outfit: SavedOutfit): string {
  const parts: string[] = [];
  const itemCount = outfit.items.length;

  if (itemCount > 0) {
    parts.push(`${itemCount} item${itemCount === 1 ? "" : "s"}`);
  }

  if (outfit.last_worn_at) {
    const lastWorn = formatLastWorn(outfit.last_worn_at);
    if (lastWorn) parts.push(`Worn ${lastWorn}`);
  } else {
    parts.push("Not worn yet");
  }

  return parts.join(" · ");
}

export function savedOutfitWeatherLine(
  weather: WeatherSnapshot | null,
): string | null {
  if (!weather) return null;

  const city = weather.city?.trim();
  const condition = weatherConditionLabel(weather.condition);
  const temp = `${Math.round(weather.temp_c)}°C`;

  if (city) return `Saved for ${temp} in ${city} · ${condition}`;
  return `Saved for ${temp} · ${condition}`;
}
