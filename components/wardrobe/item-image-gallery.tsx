'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ItemImageGalleryProps {
  imageUrls: string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 40;

export function ItemImageGallery({ imageUrls, alt }: ItemImageGalleryProps) {
  const validUrls = imageUrls.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const activeUrl = validUrls[activeIndex] ?? validUrls[0] ?? '';
  const hasMultiple = validUrls.length > 1;

  const goPrev = useCallback(() => {
    setActiveIndex((index) => (index === 0 ? validUrls.length - 1 : index - 1));
  }, [validUrls.length]);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index === validUrls.length - 1 ? 0 : index + 1));
  }, [validUrls.length]);

  function handleTouchStart(clientX: number) {
    touchStartX.current = clientX;
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;

    const delta = clientX - touchStartX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      if (delta < 0) goNext();
      else goPrev();
    }

    touchStartX.current = null;
  }

  if (!activeUrl) {
    return (
      <div className="aspect-3/4 rounded-2xl border border-neutral-200 bg-neutral-100" />
    );
  }

  return (
    <div
      className="relative aspect-3/4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
      onTouchStart={(e) => handleTouchStart(e.touches[0]?.clientX ?? 0)}
      onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
    >
      <Image
        key={activeUrl}
        src={activeUrl}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
        draggable={false}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute top-1/2 left-1 z-10 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 transition-colors hover:text-neutral-950 active:text-neutral-950"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute top-1/2 right-1 z-10 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 transition-colors hover:text-neutral-950 active:text-neutral-950"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <span className="absolute right-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
            {activeIndex + 1} / {validUrls.length}
          </span>
        </>
      )}
    </div>
  );
}
