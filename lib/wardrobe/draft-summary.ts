import type { ClothingCategory, ClothingItem } from "@/lib/types/database";

const CATEGORY_ORDER: ClothingCategory[] = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
  "accessory",
];

const CATEGORY_PLURAL: Record<ClothingCategory, string> = {
  top: "Tops",
  bottom: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessory: "Accessories",
};

export type DraftCategoryCount = {
  category: ClothingCategory;
  label: string;
  count: number;
};

export function summarizeDraftCategories(
  items: Pick<ClothingItem, "category">[],
): DraftCategoryCount[] {
  const counts = new Map<ClothingCategory, number>();

  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  return CATEGORY_ORDER.filter((category) => (counts.get(category) ?? 0) > 0).map(
    (category) => ({
      category,
      label: CATEGORY_PLURAL[category],
      count: counts.get(category)!,
    }),
  );
}
