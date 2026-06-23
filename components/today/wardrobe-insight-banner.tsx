import Link from "next/link";
import { ChevronRight, Shirt } from "lucide-react";
import type { WardrobeInsight } from "@/lib/today/wardrobe-insight";

interface WardrobeInsightBannerProps {
  insight: WardrobeInsight;
}

export function WardrobeInsightBanner({ insight }: WardrobeInsightBannerProps) {
  return (
    <Link
      href="/wardrobe"
      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-100/80 px-4 py-3.5 transition-colors hover:bg-neutral-100"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-800 shadow-sm">
        <Shirt className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">
          {insight.headline}
        </p>
        <p className="text-sm text-neutral-500">{insight.detail}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
    </Link>
  );
}
