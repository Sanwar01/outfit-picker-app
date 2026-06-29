import Link from "next/link";
import { Plus, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  missingSlotsGuidance,
  missingSlotsHeadline,
} from "@/lib/today/copy";
import type { WardrobeReadiness } from "@/lib/today/wardrobe-readiness";
import { CATEGORY_LABELS } from "@/lib/types/clothing";

interface WardrobeNudgeProps {
  readiness: Extract<WardrobeReadiness, { status: "empty" | "partial" }>;
}

export function WardrobeNudge({ readiness }: WardrobeNudgeProps) {
  if (readiness.status === "empty") {
    return (
      <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-border/60">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Shirt className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Let&apos;s build your closet
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Snap a few pieces you wear often — tops, bottoms, shoes. I&apos;ll tag
          them and start suggesting outfits.
        </p>
        <Button className="mt-6 rounded-xl px-8" render={<Link href="/wardrobe/add" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add your first items
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-border/60">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {readiness.itemCount} item{readiness.itemCount === 1 ? "" : "s"} so far
      </p>
      <h2 className="mt-1 text-lg font-semibold text-foreground">
        {missingSlotsHeadline(readiness.missing)}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {missingSlotsGuidance(readiness.missing)}
      </p>
      <ul className="mt-4 space-y-2">
        {readiness.missing.map((slot) => (
          <li
            key={slot}
            className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-sm"
          >
            <span className="text-foreground">{CATEGORY_LABELS[slot]}</span>
            <span className="text-xs text-ink-faint">Needed</span>
          </li>
        ))}
      </ul>
      <Button className="mt-5 w-full rounded-xl" render={<Link href="/wardrobe/add" />}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add clothes
      </Button>
    </div>
  );
}
