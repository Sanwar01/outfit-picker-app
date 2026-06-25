import type { ClothingCategory, ClothingItem } from "@/lib/types/database";

export type WardrobeSort = "recent" | "name" | "most_worn" | "least_worn";
export type WardrobeStatusFilter = "active" | "archived";
export type CategoryChipFilter = "all" | ClothingCategory;

export const SORT_OPTIONS: { value: WardrobeSort; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Name A–Z" },
  { value: "most_worn", label: "Most worn" },
  { value: "least_worn", label: "Least worn" },
];

export const STATUS_OPTIONS: { value: WardrobeStatusFilter; label: string }[] =
  [
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

export function sortWardrobeItems(
  items: ClothingItem[],
  sort: WardrobeSort,
): ClothingItem[] {
  const sorted = [...items];

  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "most_worn":
      return sorted.sort((a, b) => (b.wear_count ?? 0) - (a.wear_count ?? 0));
    case "least_worn":
      return sorted.sort((a, b) => (a.wear_count ?? 0) - (b.wear_count ?? 0));
    case "recent":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

export function countActiveFilters(
  sort: WardrobeSort,
  status: WardrobeStatusFilter,
): number {
  let count = 0;
  if (sort !== "recent") count += 1;
  if (status !== "active") count += 1;
  return count;
}
