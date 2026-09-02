import type { ClothingItem } from "./database";
import type { WeatherSnapshot } from "./weather";
import type { OutfitSlots } from "@/lib/outfits/slots";

export interface GeneratedOutfit {
  item_ids: string[];
  rationale: string;
  description: string;
  occasion: string;
  slots: OutfitSlots;
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  weather: WeatherSnapshot;
  generated_by?: "ai" | "rules";
  quota?: {
    meter: "outfit_ai_daily" | "outfit_shuffle_daily";
    used: number;
    limit: number | null;
    aiAllowed: boolean;
  };
}

export interface SavedOutfit {
  id: string;
  name: string | null;
  is_favorite: boolean;
  weather_snapshot: WeatherSnapshot | null;
  ai_rationale: string | null;
  created_at: string;
  last_worn_at?: string | null;
  items: ClothingItem[];
  imageUrls: Record<string, string>;
}

export const CORE_SLOT_ORDER = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
] as const;

/** Display order: core pieces first, then all accessories. */
export const SLOT_ORDER = [...CORE_SLOT_ORDER, "accessories"] as const;
