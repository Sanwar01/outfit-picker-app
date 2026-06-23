'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { StyleCompanion } from '@/lib/wardrobe/item-detail-data';

interface HowIStyleSectionProps {
  itemId: string;
  companions: StyleCompanion[];
  outfitCount: number;
}

export function HowIStyleSection({
  itemId,
  companions,
  outfitCount,
}: HowIStyleSectionProps) {
  if (outfitCount === 0 && companions.length === 0) {
    return null;
  }

  return (
    <section className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950">
            How I style this
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            This item goes well with
          </p>
        </div>
        {outfitCount > 0 && (
          <Link
            href={`/outfits?itemId=${itemId}`}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            See outfits
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {companions.length > 0 ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {companions.map((companion) => (
            <Link
              key={companion.id}
              href={`/wardrobe/${companion.id}`}
              className="w-24 shrink-0 text-left"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                {companion.imageUrl && (
                  <Image
                    src={companion.imageUrl}
                    alt={companion.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-medium text-neutral-900">
                {companion.name}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Save outfits with this piece to see styling ideas here.
        </p>
      )}
    </section>
  );
}
