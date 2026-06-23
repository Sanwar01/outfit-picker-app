'use client';

import Image from 'next/image';
import { formatRelativeAdded } from '@/lib/wardrobe/grouping';
import type { ClothingItem } from '@/lib/types/database';

interface RecentlyAddedStripProps {
  items: ClothingItem[];
  imageUrls: Record<string, string>;
  onSelectItem: (item: ClothingItem) => void;
}

export function RecentlyAddedStrip({
  items,
  imageUrls,
  onSelectItem,
}: RecentlyAddedStripProps) {
  if (items.length === 0) return null;

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectItem(item)}
          className="w-28 shrink-0 text-left"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
            <Image
              src={imageUrls[item.image_url] ?? ''}
              alt={item.name}
              fill
              className="object-cover"
              sizes="112px"
              unoptimized
            />
          </div>
          <p className="mt-2 truncate text-xs font-medium text-neutral-950">
            {item.name}
          </p>
          <p className="text-[11px] text-neutral-400">
            {formatRelativeAdded(item.created_at)}
          </p>
        </button>
      ))}
    </div>
  );
}
