import type { ClothingCategory, ClothingItem } from "@/lib/types/database";

export const BROWSE_CATEGORIES: ClothingCategory[] = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
  "accessory",
];

export const CATEGORY_PLURAL_LABELS: Record<ClothingCategory, string> = {
  top: "Tops",
  bottom: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessory: "Accessories",
};

export interface CategorySummary {
  category: ClothingCategory;
  label: string;
  count: number;
  coverItem: ClothingItem | null;
}

export function formatRelativeAdded(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export function buildCategorySummaries(
  items: ClothingItem[]
): CategorySummary[] {
  const active = items.filter((item) => item.status === "active");

  return BROWSE_CATEGORIES.map((category) => {
    const inCategory = active
      .filter((item) => item.category === category)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    return {
      category,
      label: CATEGORY_PLURAL_LABELS[category],
      count: inCategory.length,
      coverItem: inCategory[0] ?? null,
    };
  });
}

export function getRecentlyAdded(
  items: ClothingItem[],
  limit = 8
): ClothingItem[] {
  return items
    .filter((item) => item.status === "active")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}
