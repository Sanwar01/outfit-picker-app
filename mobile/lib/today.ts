import type { GeneratedOutfit } from "@shared/types/outfit";
import type { ClothingItem } from "@shared/types/database";
import { apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { defaultSavedOutfitName } from "@shared/outfits/saved-outfit-name";
import {
  hasRequiredOutfitSlots,
  itemsToOutfitSlots,
  normalizeOutfitSlots,
} from "@shared/outfits/slots";

export type WardrobeReadiness =
  | { status: "empty" }
  | { status: "partial"; itemCount: number }
  | { status: "ready"; itemCount: number };

export function checkWardrobeReadiness(items: ClothingItem[]): WardrobeReadiness {
  const active = items.filter((i) => i.status === "active");
  if (active.length === 0) return { status: "empty" };
  const categories = new Set(active.map((i) => i.category));
  const hasTop = categories.has("top");
  const hasBottom = categories.has("bottom");
  const hasShoes = categories.has("shoes");
  if (hasTop && hasBottom && hasShoes) {
    return { status: "ready", itemCount: active.length };
  }
  return { status: "partial", itemCount: active.length };
}

export async function fetchWardrobe(userId: string) {
  const { data } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");
  return (data ?? []) as ClothingItem[];
}

export async function generateOutfit(
  excludeCombinations: string[][] = [],
  occasion = "auto",
): Promise<{ ok: true; outfit: GeneratedOutfit } | { ok: false; error: string }> {
  const result = await apiPost<GeneratedOutfit>("/api/outfits/generate", {
    occasion,
    excludeCombinations,
  });
  if (!result.ok) return result;
  return { ok: true, outfit: result.data };
}

export async function wearOutfit(itemIds: string[]) {
  return apiPost("/api/outfits/wear", { itemIds });
}

function resolveSlotsForSave(outfit: GeneratedOutfit) {
  let slots = normalizeOutfitSlots(outfit.slots);
  if (!hasRequiredOutfitSlots(slots) && outfit.items.length > 0) {
    slots = itemsToOutfitSlots(outfit.items);
  }
  return slots;
}

export async function saveOutfit(outfit: GeneratedOutfit, name?: string) {
  const slots = resolveSlotsForSave(outfit);

  return apiPost("/api/outfits", {
    slots,
    item_ids: outfit.item_ids,
    rationale: outfit.description || outfit.rationale,
    weather: outfit.weather,
    name: name ?? defaultSavedOutfitName(),
  });
}
