'use client';

import Image from 'next/image';
import { Check, RefreshCw } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/types/clothing';
import type { ClothingCategory, ClothingItem } from '@/lib/types/database';
import { buildWhyThisWorks } from '@/lib/today/why-this-works';
import { SLOT_ORDER, type GeneratedOutfit } from '@/lib/types/outfit';

interface OutfitRecommendationCardProps {
  outfit: GeneratedOutfit;
  styleVibes: string[];
  onShuffle: () => void;
  shuffleDisabled?: boolean;
}

function pickHeroItem(items: ClothingItem[]): ClothingItem {
  const byCategory = new Map(items.map((item) => [item.category, item]));
  return (
    byCategory.get('outerwear') ??
    byCategory.get('top') ??
    byCategory.get('bottom') ??
    items[0]
  );
}

export function OutfitRecommendationCard({
  outfit,
  styleVibes,
  onShuffle,
  shuffleDisabled,
}: OutfitRecommendationCardProps) {
  const sortedItems = SLOT_ORDER.flatMap((slot) => {
    const itemId = outfit.slots[slot];
    if (!itemId) return [];
    const item = outfit.items.find((i) => i.id === itemId);
    return item ? [item] : [];
  });

  const heroItem = pickHeroItem(sortedItems);
  const reasons = buildWhyThisWorks(
    sortedItems,
    outfit.weather,
    styleVibes,
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-4 py-3.5">
        <h2 className="text-xs font-semibold tracking-[0.12em] text-neutral-950 uppercase">
          Today&apos;s outfit ✨
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Recommended for the weather and your style
        </p>
      </div>

      <div className="flex gap-3 p-4">
        <div className="relative w-[50%] shrink-0">
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100">
            <Image
              src={outfit.imageUrls[heroItem.image_url] ?? ''}
              alt={heroItem.name}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
          <button
            type="button"
            onClick={onShuffle}
            disabled={shuffleDisabled}
            className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-60"
          >
            <RefreshCw className="h-3 w-3" />
            Another option
          </button>
        </div>

        <ul className="min-w-0 flex-1 space-y-3.5 pt-1">
          {sortedItems.map((item) => (
            <li key={item.id} className="flex items-center gap-2.5">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                <Image
                  src={outfit.imageUrls[item.image_url] ?? ''}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-950">
                  {item.name}
                </p>
                <p className="text-xs text-neutral-400">
                  {item.brand ??
                    CATEGORY_LABELS[item.category as ClothingCategory]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-neutral-100 px-4 py-3.5">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-neutral-400 uppercase">
          Why this works
        </p>
        <ul className="mt-2.5 space-y-2">
          {reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-sm text-neutral-700"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-neutral-950"
                strokeWidth={2}
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
