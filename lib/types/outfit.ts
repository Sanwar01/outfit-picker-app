import type { ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

export interface GeneratedOutfit {
  item_ids: string[];
  rationale: string;
  slots: Record<string, string>;
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  weather: WeatherSnapshot;
  generated_by?: "ai" | "rules";
}

export interface SavedOutfit {
  id: string;
  name: string | null;
  is_favorite: boolean;
  weather_snapshot: WeatherSnapshot | null;
  ai_rationale: string | null;
  created_at: string;
  items: ClothingItem[];
  imageUrls: Record<string, string>;
}

export const SLOT_ORDER = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
  "accessory",
] as const;
