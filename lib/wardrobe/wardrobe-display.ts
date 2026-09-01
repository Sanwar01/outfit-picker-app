import type { ClothingCategory, ClothingItem } from "@/lib/types/database";
import { CATEGORY_LABELS, type FilterValue } from "@/lib/types/clothing";

export const WARDROBE_SORT_OPTIONS = [
  { value: "recent", label: "Recent" },
  { value: "name", label: "A–Z" },
  { value: "most_worn", label: "Most worn" },
  { value: "favorites", label: "Favourites" },
  { value: "last_worn", label: "Last worn" },
] as const;

export type WardrobeSortValue = (typeof WARDROBE_SORT_OPTIONS)[number]["value"];

export function filterWardrobeItems(
  items: ClothingItem[],
  filter: FilterValue,
): ClothingItem[] {
  if (filter === "all") {
    return items.filter((item) => item.status === "active");
  }
  if (filter === "archived") {
    return items.filter((item) => item.status === "archived");
  }
  return items.filter(
    (item) => item.status === "active" && item.category === filter,
  );
}

export function wardrobeItemSubtitle(item: ClothingItem): string {
  const parts = [CATEGORY_LABELS[item.category]];
  const color = item.colors[0];
  if (color) {
    parts.push(color.charAt(0).toUpperCase() + color.slice(1));
  }
  return parts.join(" · ");
}

function wardrobeItemSearchText(item: ClothingItem): string {
  return [
    item.name,
    item.brand,
    item.sub_category,
    item.category,
    CATEGORY_LABELS[item.category],
    item.material,
    ...item.colors,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function searchWardrobeItems(
  items: ClothingItem[],
  query: string,
): ClothingItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;

  return items.filter((item) => wardrobeItemSearchText(item).includes(needle));
}

export function sortWardrobeItems(
  items: ClothingItem[],
  sort: WardrobeSortValue,
): ClothingItem[] {
  const copy = [...items];

  switch (sort) {
    case "name":
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
      );
    case "most_worn":
      return copy.sort(
        (a, b) =>
          b.wear_count - a.wear_count ||
          b.created_at.localeCompare(a.created_at),
      );
    case "favorites":
      return copy.sort(
        (a, b) =>
          Number(b.is_favorite) - Number(a.is_favorite) ||
          b.created_at.localeCompare(a.created_at),
      );
    case "last_worn":
      return copy.sort((a, b) => {
        const aTime = a.last_worn_at ? Date.parse(a.last_worn_at) : 0;
        const bTime = b.last_worn_at ? Date.parse(b.last_worn_at) : 0;
        return bTime - aTime || b.created_at.localeCompare(a.created_at);
      });
    case "recent":
    default:
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export function prepareWardrobeList(
  items: ClothingItem[],
  filter: FilterValue,
  query: string,
  sort: WardrobeSortValue,
): ClothingItem[] {
  return sortWardrobeItems(
    searchWardrobeItems(filterWardrobeItems(items, filter), query),
    sort,
  );
}

export function wardrobeSummaryLine(activeCount: number): string {
  if (activeCount === 0) return "No items yet";
  return `${activeCount} item${activeCount === 1 ? "" : "s"}`;
}

export function wardrobeCategoryBreakdown(
  items: ClothingItem[],
): Partial<Record<ClothingCategory, number>> {
  const counts: Partial<Record<ClothingCategory, number>> = {};
  for (const item of items) {
    if (item.status !== "active") continue;
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}

export function formatLastWorn(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
