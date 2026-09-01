import type { ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import {
  CORE_SLOT_ORDER,
  normalizeOutfitSlots,
  type OutfitSlots,
} from "@/lib/outfits/slots";
import type { OccasionId } from "@/lib/today/occasions";
import { getOccasion, occasionLabel } from "@/lib/today/occasions";

function formatItemList(items: ClothingItem[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return `your ${items[0].name}`;
  if (items.length === 2) {
    return `your ${items[0].name} and ${items[1].name}`;
  }
  const last = items[items.length - 1];
  const rest = items.slice(0, -1).map((i) => i.name).join(", ");
  return `your ${rest}, and ${last.name}`;
}

function orderedItemsFromSlots(
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

  return ordered;
}

export function buildOutfitDescription(
  items: ClothingItem[],
  slots: OutfitSlots | Record<string, string | string[]>,
  occasionId: OccasionId,
  weather: WeatherSnapshot,
): string {
  const normalized = normalizeOutfitSlots(slots);
  const ordered = orderedItemsFromSlots(items, normalized);

  if (ordered.length === 0) {
    return "Here's a look from your wardrobe.";
  }

  const occasion = getOccasion(occasionId);
  const itemPhrase = formatItemList(ordered);
  const tempHint =
    weather.temp_c < 12
      ? "cool weather"
      : weather.temp_c > 24
        ? "warm weather"
        : "today's weather";

  if (occasionId === "auto") {
    return `For ${tempHint}, try ${itemPhrase}. The pieces balance comfort and your personal style.`;
  }

  return `For ${occasion.label.toLowerCase()}, pair ${itemPhrase}. Styled for ${tempHint} — ${occasion.description.toLowerCase()}.`;
}

export function buildShortRationale(
  occasionId: OccasionId,
  weather: WeatherSnapshot,
): string {
  const label =
    occasionId === "auto"
      ? "Your look for today"
      : `Your ${occasionLabel(occasionId).toLowerCase()} look`;

  const temp =
    weather.temp_c < 12 ? "cool" : weather.temp_c > 24 ? "warm" : "mild";

  return `${label} — balanced for ${temp} weather.`;
}
