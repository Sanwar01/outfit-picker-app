'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ItemImageGalleryProps {
  imageUrls: string[];
  alt: string;
}

export function ItemImageGallery({ imageUrls, alt }: ItemImageGalleryProps) {
  const validUrls = imageUrls.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = validUrls[activeIndex] ?? validUrls[0] ?? '';

  if (!activeUrl) {
    return (
      <div className="aspect-3/4 rounded-2xl border border-neutral-200 bg-neutral-100" />
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
        <Image
          src={activeUrl}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
        {validUrls.length > 1 && (
          <span className="absolute right-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
            {activeIndex + 1} / {validUrls.length}
          </span>
        )}
      </div>

      {validUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                index === activeIndex
                  ? 'border-neutral-950'
                  : 'border-neutral-200 opacity-80 hover:opacity-100',
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
