import { getSignedImageUrls } from "@/lib/storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClothingCategory, ClothingItem, Outfit } from "@/lib/types/database";
import type { SavedOutfit } from "@/lib/types/outfit";
import { CORE_SLOT_ORDER } from "@/lib/types/outfit";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

type OutfitItemRow = {
  outfit_id: string;
  clothing_item_id: string;
  slot: ClothingCategory;
};

function toSavedOutfit(
  outfit: Outfit,
  extras: Pick<SavedOutfit, "last_worn_at" | "items" | "imageUrls">,
): SavedOutfit {
  return {
    id: outfit.id,
    name: outfit.name,
    is_favorite: outfit.is_favorite,
    weather_snapshot: outfit.weather_snapshot as WeatherSnapshot | null,
    ai_rationale: outfit.ai_rationale,
    created_at: outfit.created_at,
    ...extras,
  };
}

export async function getSavedOutfitById(
  supabase: SupabaseClient,
  userId: string,
  outfitId: string,
): Promise<SavedOutfit | null> {
  const { data: outfit } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", outfitId)
    .eq("user_id", userId)
    .single();

  if (!outfit) return null;

  const typedOutfit = outfit as Outfit;

  const [{ data: wearLogs }, { data: outfitItems }] = await Promise.all([
    supabase
      .from("wear_log")
      .select("worn_at")
      .eq("user_id", userId)
      .eq("outfit_id", outfitId)
      .order("worn_at", { ascending: false })
      .limit(1),
    supabase.from("outfit_items").select("*").eq("outfit_id", outfitId),
  ]);

  const typedOutfitItems = (outfitItems ?? []) as OutfitItemRow[];
  const clothingIds = typedOutfitItems.map((oi) => oi.clothing_item_id);

  if (clothingIds.length === 0) {
    return toSavedOutfit(typedOutfit, {
      last_worn_at: wearLogs?.[0]?.worn_at ?? null,
      items: [],
      imageUrls: {},
    });
  }

  const { data: clothing } = await supabase
    .from("clothing_items")
    .select("*")
    .in("id", clothingIds);

  const typedClothing = (clothing ?? []) as ClothingItem[];
  const clothingMap = new Map(typedClothing.map((c) => [c.id, c]));

  let imageUrls: Record<string, string> = {};
  try {
    imageUrls = await getSignedImageUrls(typedClothing.map((c) => c.image_url));
  } catch {
    // Dev without storage credentials
  }

  const coreItems = CORE_SLOT_ORDER.flatMap((slot) => {
    const itemId = typedOutfitItems.find((row) => row.slot === slot)
      ?.clothing_item_id;
    if (!itemId) return [];
    const item = clothingMap.get(itemId);
    return item ? [item] : [];
  });

  const accessories = typedOutfitItems
    .filter((row) => row.slot === "accessory")
    .map((row) => clothingMap.get(row.clothing_item_id))
    .filter((item): item is ClothingItem => !!item);

  const ordered = [...coreItems];
  for (const item of accessories) {
    if (!ordered.some((entry) => entry.id === item.id)) {
      ordered.push(item);
    }
  }

  const unsorted = typedClothing.filter(
    (item) => !ordered.some((sorted) => sorted.id === item.id),
  );
  const allItems = [...ordered, ...unsorted];

  return toSavedOutfit(typedOutfit, {
    last_worn_at: wearLogs?.[0]?.worn_at ?? null,
    items: allItems,
    imageUrls,
  });
}

export function getOutfitGalleryUrls(outfit: SavedOutfit): string[] {
  return outfit.items
    .map((item) => outfit.imageUrls[item.image_url] ?? "")
    .filter(Boolean);
}

export function splitRationaleBullets(rationale: string | null): string[] {
  if (!rationale?.trim()) return [];
  return rationale
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
