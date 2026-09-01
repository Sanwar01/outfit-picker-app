import type { ClothingTagResult } from "@/lib/ai/tag-clothing";
import type { ClothingItemUpdate } from "@/lib/wardrobe/draft-update";
import { normalizeSeasonId } from "@/lib/wardrobe/item-edit";

export function clothingTagsToUpdate(
  tags: ClothingTagResult,
): ClothingItemUpdate {
  return {
    name: tags.name,
    category: tags.category,
    sub_category: tags.sub_category,
    colors: tags.colors,
    pattern: tags.pattern,
    season: tags.season.map(normalizeSeasonId),
    formality: tags.formality,
    style_tags: tags.style_tags,
    occasions: tags.occasions,
    material: tags.material,
    brand: tags.brand,
    warmth: tags.warmth,
    ai_confidence: tags.confidence,
  };
}
