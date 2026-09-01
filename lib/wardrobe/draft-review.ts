import type { ClothingCategory, ClothingItem } from '@/lib/types/database';
import { fitLabel } from '@/lib/wardrobe/clothing-fit';
import { formalityLabel, seasonDisplayLabel } from '@/lib/wardrobe/item-edit';
import { CATEGORY_LABELS } from '@/lib/types/clothing';

const CATEGORY_PLURAL: Record<ClothingCategory, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessories',
};

export function categoryPluralLabel(category: ClothingCategory): string {
  return CATEGORY_PLURAL[category] ?? CATEGORY_LABELS[category];
}

export function draftReviewMetaLine(
  item: Pick<ClothingItem, 'category' | 'formality' | 'fit'>,
): string {
  return [
    categoryPluralLabel(item.category),
    formalityLabel(item.formality),
    fitLabel(item.fit),
  ].join(' · ');
}

export function draftReviewColorSeasonLine(
  item: Pick<ClothingItem, 'colors' | 'season'>,
): string {
  const color = item.colors[0]
    ? item.colors[0].charAt(0).toUpperCase() + item.colors[0].slice(1)
    : 'Unknown colour';
  return `${color} · ${seasonDisplayLabel(item.season)}`;
}
