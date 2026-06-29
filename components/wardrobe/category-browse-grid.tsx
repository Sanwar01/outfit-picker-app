'use client';

import Image from 'next/image';
import type { CategorySummary } from '@/lib/wardrobe/grouping';
import type { ClothingCategory } from '@/lib/types/database';

interface CategoryBrowseGridProps {
  categories: CategorySummary[];
  imageUrls: Record<string, string>;
  onSelectCategory: (category: ClothingCategory) => void;
}

export function CategoryBrowseGrid({
  categories,
  imageUrls,
  onSelectCategory,
}: CategoryBrowseGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => (
        <button
          key={category.category}
          type="button"
          onClick={() => onSelectCategory(category.category)}
          className="overflow-hidden rounded-2xl border border-border bg-white text-left shadow-sm transition-colors hover:bg-background"
        >
          <div className="relative aspect-4/3 bg-muted">
            {category.coverItem ? (
              <Image
                src={imageUrls[category.coverItem.image_url] ?? ''}
                alt={category.label}
                fill
                className="object-contain p-2"
                sizes="50vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-ink-faint">
                No items yet
              </div>
            )}
          </div>
          <div className="px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">
              {category.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {category.count}{' '}
              {category.count === 1 ? 'item' : 'items'}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
