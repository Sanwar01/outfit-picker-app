import { CATEGORY_LABELS } from "@/lib/types/clothing";
import type { ClothingCategory } from "@/lib/types/database";

export const SEASON_OPTIONS = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
] as const;

export const MATERIAL_OPTIONS = [
  "Cotton",
  "Wool",
  "Linen",
  "Polyester",
  "Denim",
  "Leather",
  "Synthetic",
  "Blend",
  "Other",
] as const;

export const CARE_OPTIONS = [
  "Machine wash cold",
  "Machine wash warm",
  "Hand wash",
  "Dry clean only",
  "Spot clean",
  "Do not wash",
] as const;

export const COLOR_SWATCHES = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Beige", hex: "#d4c4a8" },
  { name: "Brown", hex: "#6b4f3a" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Blue", hex: "#4a6fa5" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Green", hex: "#4a7c59" },
  { name: "Red", hex: "#b83a3a" },
  { name: "Pink", hex: "#e8b4b8" },
] as const;

export const NOTES_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 200;

export const FORMALITY_OPTIONS = [
  { value: 1, label: "Relaxed" },
  { value: 2, label: "Casual" },
  { value: 3, label: "Smart casual" },
  { value: 4, label: "Formal" },
  { value: 5, label: "Very formal" },
] as const;

export const SUB_CATEGORY_OPTIONS: Record<ClothingCategory, string[]> = {
  top: [
    "T-shirt",
    "Shirt",
    "Overshirt",
    "Sweater",
    "Hoodie",
    "Blouse",
    "Tank top",
    "Polo",
    "Other",
  ],
  bottom: [
    "Jeans",
    "Chinos",
    "Trousers",
    "Shorts",
    "Skirt",
    "Leggings",
    "Joggers",
    "Other",
  ],
  outerwear: [
    "Jacket",
    "Coat",
    "Blazer",
    "Gilet",
    "Parka",
    "Trench coat",
    "Other",
  ],
  shoes: [
    "Sneakers",
    "Boots",
    "Loafers",
    "Sandals",
    "Heels",
    "Trainers",
    "Other",
  ],
  accessory: [
    "Bag",
    "Belt",
    "Hat",
    "Scarf",
    "Watch",
    "Jewellery",
    "Sunglasses",
    "Other",
  ],
};

export function normalizeSeasonId(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower === "fall") return "autumn";
  return lower;
}

export function wearFrequencyLabel(wearCount: number): string {
  if (wearCount >= 10) return "Often";
  if (wearCount >= 3) return "Sometimes";
  if (wearCount >= 1) return "Occasionally";
  return "Rarely worn";
}

export function lastWornLabel(lastWornAt: string | null): string {
  if (!lastWornAt) return "Never";

  const days = Math.floor(
    (Date.now() - new Date(lastWornAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatItemDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  return DATE_FORMATTER.format(new Date(isoDate));
}

export function timesWornLabel(wearCount: number): string {
  if (wearCount === 0) return "Never worn";
  if (wearCount === 1) return "1 time";
  return `${wearCount} times`;
}

export function seasonDisplayLabel(seasons: string[]): string {
  if (seasons.length === 0) return "All seasons";

  const labels = seasons.map((season) => {
    const normalized = normalizeSeasonId(season);
    const match = SEASON_OPTIONS.find((option) => option.id === normalized);
    return match?.label ?? season;
  });

  return labels.join(" / ");
}

export function formalityLabel(formality: number): string {
  if (formality <= 1) return "Relaxed";
  if (formality === 2) return "Casual";
  if (formality === 3) return "Smart casual";
  if (formality === 4) return "Formal";
  return "Very formal";
}

export function colorSwatchHex(colorName: string): string | null {
  const match = COLOR_SWATCHES.find(
    (swatch) => swatch.name.toLowerCase() === colorName.toLowerCase()
  );
  return match?.hex ?? null;
}

export function itemDescription(item: {
  description: string | null;
  material: string | null;
  category: ClothingCategory;
  pattern: string;
}): string | null {
  if (item.description?.trim()) {
    return item.description.trim();
  }
  if (item.material) {
    const categoryLabel = CATEGORY_LABELS[item.category].toLowerCase();
    return `${item.material} ${categoryLabel}.`;
  }
  if (item.pattern && item.pattern !== "solid") {
    return `${item.pattern.charAt(0).toUpperCase()}${item.pattern.slice(1)} pattern.`;
  }
  return null;
}

export function costPerWearLabel(
  purchasePrice: number | null,
  wearCount: number
): string | null {
  if (purchasePrice == null || purchasePrice <= 0) return null;
  if (wearCount <= 0) return `$${purchasePrice.toFixed(2)}`;
  return `$${(purchasePrice / wearCount).toFixed(2)}`;
}

export function formatPurchasePrice(price: number | null): string | null {
  if (price == null || price <= 0) return null;
  return `$${price.toFixed(2)}`;
}
