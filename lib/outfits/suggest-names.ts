import type { ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function dominantColor(items: ClothingItem[]): string | null {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const color of item.colors) {
      const key = color.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [color, count] of counts) {
    if (count > bestCount) {
      best = color;
      bestCount = count;
    }
  }

  return best ? capitalize(best) : null;
}

function averageFormality(items: ClothingItem[]): number {
  if (items.length === 0) return 3;
  return items.reduce((sum, item) => sum + item.formality, 0) / items.length;
}

function shortenItemName(name: string): string {
  const stopWords = new Set(["a", "an", "the", "with", "and", "in"]);
  const words = name
    .split(/\s+/)
    .filter((word) => !stopWords.has(word.toLowerCase()));
  return words.slice(0, 3).join(" ");
}

function weatherMood(weather: WeatherSnapshot): string | null {
  const rainy =
    weather.precip_chance >= 40 ||
    ["rain", "drizzle", "storm"].includes(weather.condition);

  if (rainy) return "Rainy Day";
  if (weather.temp_c >= 26) return "Warm Weather";
  if (weather.temp_c <= 12) return "Cold Day";
  if (weather.condition === "clear") return "Sunny Day";
  if (weather.condition === "partly_cloudy") return "Mild Day";
  return null;
}

function formalityLabel(formality: number): string | null {
  if (formality >= 4) return "Smart Look";
  if (formality <= 2) return "Casual Fit";
  return null;
}

export function suggestOutfitNames(
  items: ClothingItem[],
  weather: WeatherSnapshot
): string[] {
  const suggestions: string[] = [];
  const seen = new Set<string>();
  const add = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) return;
    seen.add(trimmed.toLowerCase());
    suggestions.push(trimmed);
  };

  const color = dominantColor(items);
  const mood = weatherMood(weather);
  const formality = averageFormality(items);
  const formalityName = formalityLabel(formality);
  const top = items.find((item) => item.category === "top");
  const outerwear = items.find((item) => item.category === "outerwear");
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

  if (color && mood) add(`${color} ${mood}`);
  if (color) add(`${color} Combo`);
  if (mood) add(`${mood} Fit`);
  if (formalityName) add(formalityName);
  if (top) add(`${shortenItemName(top.name)} Look`);
  if (outerwear) add(`Layered ${shortenItemName(outerwear.name)}`);
  if (color && formality >= 4) add(`Polished ${color}`);
  add(`${day} Outfit`);

  return suggestions.slice(0, 6);
}

export function defaultOutfitName(
  items: ClothingItem[],
  weather: WeatherSnapshot
): string {
  return suggestOutfitNames(items, weather)[0] ?? "Saved outfit";
}
