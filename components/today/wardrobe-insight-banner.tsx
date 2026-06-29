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
      className="flex items-center gap-3 rounded-2xl border border-border bg-muted/80 px-4 py-3.5 transition-colors hover:bg-muted"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-foreground shadow-sm">
        <Shirt className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {insight.headline}
        </p>
        <p className="text-sm text-muted-foreground">{insight.detail}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
    </Link>
  );
}
