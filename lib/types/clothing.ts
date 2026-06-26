import type { ClothingCategory, ClothingItem } from './database';

export const STYLE_VIBES = [
  'Minimal',
  'Classic',
  'Casual',
  'Streetwear',
  'Smart casual',
  'Elegant',
] as const;

export type StyleVibe = (typeof STYLE_VIBES)[number];

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: 'Top',
  bottom: 'Bottom',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessory',
};

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'archived', label: 'Archived' },
] as const;

export type FilterValue = (typeof FILTER_OPTIONS)[number]['value'];

export function needsReview(item: ClothingItem): boolean {
  return item.ai_confidence !== null && item.ai_confidence < 0.7;
}
