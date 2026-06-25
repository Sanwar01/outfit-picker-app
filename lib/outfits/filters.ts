import type { ClothingItem } from "@/lib/types/database";
import type { SavedOutfit } from "@/lib/types/outfit";

export type OutfitTab = "all" | "favorites";
export type OutfitSort = "saved" | "name" | "worn";
export type OutfitView = "grid" | "list";

export const OUTFIT_TAB_OPTIONS: { value: OutfitTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "favorites", label: "Favorites" },
];

export const OUTFIT_SORT_OPTIONS: { value: OutfitSort; label: string }[] = [
  { value: "saved", label: "Recently saved" },
  { value: "name", label: "Name A–Z" },
  { value: "worn", label: "Recently worn" },
];

export function countActiveOutfitFilters(sort: OutfitSort): number {
  return sort === "saved" ? 0 : 1;
}

export function filterOutfitsByTab(
  outfits: SavedOutfit[],
  tab: OutfitTab,
): SavedOutfit[] {
  if (tab === "favorites") {
    return outfits.filter((outfit) => outfit.is_favorite);
  }
  return outfits;
}

export function sortOutfits(
  outfits: SavedOutfit[],
  sort: OutfitSort,
): SavedOutfit[] {
  const sorted = [...outfits];

  switch (sort) {
    case "name":
      return sorted.sort((a, b) =>
        (a.name ?? "Saved outfit").localeCompare(b.name ?? "Saved outfit"),
      );
    case "worn":
      return sorted.sort((a, b) => {
        const aTime = a.last_worn_at
          ? new Date(a.last_worn_at).getTime()
          : 0;
        const bTime = b.last_worn_at
          ? new Date(b.last_worn_at).getTime()
          : 0;
        return bTime - aTime;
      });
    case "saved":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

export function pickOutfitHeroItem(items: ClothingItem[]): ClothingItem {
  const byCategory = new Map(items.map((item) => [item.category, item]));
  return (
    byCategory.get("outerwear") ??
    byCategory.get("top") ??
    byCategory.get("bottom") ??
    items[0]
  );
}

export function outfitSubtitle(outfit: SavedOutfit): string {
  if (outfit.ai_rationale?.trim()) {
    return outfit.ai_rationale.trim();
  }
  const count = outfit.items.length;
  return `${count} ${count === 1 ? "piece" : "pieces"} from your wardrobe`;
}
