import type { Database } from "@/lib/types/database";

export type ClothingItemUpdate =
  Database["public"]["Tables"]["clothing_items"]["Update"];

/** Fields safe to write before the draft-review migration is applied remotely. */
export type ClothingItemDraftUpdate = Pick<
  ClothingItemUpdate,
  | "name"
  | "category"
  | "sub_category"
  | "colors"
  | "pattern"
  | "season"
  | "formality"
  | "style_tags"
  | "occasions"
  | "material"
  | "brand"
  | "warmth"
  | "ai_confidence"
  | "is_favorite"
  | "purchase_price"
  | "status"
  | "notes"
>;

export function pickDraftUpdate(
  update: ClothingItemUpdate,
): ClothingItemDraftUpdate {
  const picked: ClothingItemDraftUpdate = {};

  if (update.name !== undefined) picked.name = update.name;
  if (update.category !== undefined) picked.category = update.category;
  if (update.sub_category !== undefined) picked.sub_category = update.sub_category;
  if (update.colors !== undefined) picked.colors = update.colors;
  if (update.pattern !== undefined) picked.pattern = update.pattern;
  if (update.season !== undefined) picked.season = update.season;
  if (update.formality !== undefined) picked.formality = update.formality;
  if (update.style_tags !== undefined) picked.style_tags = update.style_tags;
  if (update.occasions !== undefined) picked.occasions = update.occasions;
  if (update.material !== undefined) picked.material = update.material;
  if (update.brand !== undefined) picked.brand = update.brand;
  if (update.warmth !== undefined) picked.warmth = update.warmth;
  if (update.ai_confidence !== undefined) {
    picked.ai_confidence = update.ai_confidence;
  }
  if (update.is_favorite !== undefined) picked.is_favorite = update.is_favorite;
  if (update.purchase_price !== undefined) {
    picked.purchase_price = update.purchase_price;
  }
  if (update.status !== undefined) picked.status = update.status;
  if (update.notes !== undefined) picked.notes = update.notes;

  return picked;
}
