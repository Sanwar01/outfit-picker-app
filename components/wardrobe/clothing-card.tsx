"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, needsReview } from "@/lib/types/clothing";
import type { ClothingItem } from "@/lib/types/database";

interface ClothingCardProps {
  item: ClothingItem;
  imageUrl: string;
}

export function ClothingCard({ item, imageUrl }: ClothingCardProps) {
  return (
    <Link
      href={`/wardrobe/${item.id}`}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-3/4 bg-neutral-100">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized
        />
        {needsReview(item) && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium text-neutral-950">
          {item.name}
        </p>
        <Badge variant="secondary" className="rounded-full text-xs">
          {CATEGORY_LABELS[item.category]}
        </Badge>
      </div>
    </Link>
  );
}
