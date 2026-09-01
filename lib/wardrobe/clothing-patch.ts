import type { ClothingCategory, ClothingFit } from "@/lib/types/database";
import type { ClothingItemUpdate } from "@/lib/wardrobe/draft-update";

const CATEGORIES: ClothingCategory[] = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
  "accessory",
];

const FITS: ClothingFit[] = ["regular", "slim", "relaxed", "oversized"];

export function buildClothingPatchUpdate(
  body: Record<string, unknown>,
  options?: { clearAiConfidence?: boolean },
): ClothingItemUpdate {
  const update: ClothingItemUpdate = {};

  if (typeof body.name === "string" && body.name.trim()) {
    update.name = body.name.trim();
  }
  if (CATEGORIES.includes(body.category as ClothingCategory)) {
    update.category = body.category as ClothingCategory;
  }
  if (typeof body.sub_category === "string") {
    update.sub_category = body.sub_category.trim() || null;
  }
  if (Array.isArray(body.colors)) {
    update.colors = body.colors.filter(
      (color: unknown): color is string =>
        typeof color === "string" && color.trim().length > 0,
    );
  }
  if (typeof body.pattern === "string") {
    update.pattern = body.pattern.trim() || "solid";
  }
  if (Array.isArray(body.season)) {
    update.season = body.season.filter(
      (season: unknown): season is string => typeof season === "string",
    );
  }
  if (
    typeof body.formality === "number" &&
    body.formality >= 1 &&
    body.formality <= 5
  ) {
    update.formality = body.formality;
  }
  if (Array.isArray(body.style_tags)) {
    update.style_tags = body.style_tags.filter(
      (tag: unknown): tag is string => typeof tag === "string",
    );
  }
  if (Array.isArray(body.occasions)) {
    update.occasions = body.occasions.filter(
      (occasion: unknown): occasion is string => typeof occasion === "string",
    );
  }
  if (typeof body.material === "string") {
    update.material = body.material.trim() || null;
  }
  if (typeof body.brand === "string") {
    update.brand = body.brand.trim() || null;
  }
  if (body.fit === null || FITS.includes(body.fit as ClothingFit)) {
    update.fit = body.fit as ClothingFit | null;
  }
  if (
    body.warmth === null ||
    (typeof body.warmth === "number" && body.warmth >= 1 && body.warmth <= 5)
  ) {
    update.warmth = body.warmth as number | null;
  }
  if (typeof body.size === "string") {
    update.size = body.size.trim() || null;
  }
  if (
    body.purchase_price === null ||
    typeof body.purchase_price === "number"
  ) {
    update.purchase_price = body.purchase_price as number | null;
  }
  if (body.purchase_date === null || typeof body.purchase_date === "string") {
    update.purchase_date = body.purchase_date as string | null;
  }
  if (typeof body.is_favorite === "boolean") {
    update.is_favorite = body.is_favorite;
  }
  if (typeof body.exclude_from_recommendations === "boolean") {
    update.exclude_from_recommendations = body.exclude_from_recommendations;
  }
  if (body.status === "active" || body.status === "archived") {
    update.status = body.status;
  }

  if (options?.clearAiConfidence) {
    update.ai_confidence = null;
  }

  return update;
}
