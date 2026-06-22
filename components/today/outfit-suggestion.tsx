'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { OutfitGeneratingLoader } from '@/components/today/outfit-generating-loader';
import { SaveOutfitDialog } from '@/components/today/save-outfit-dialog';
import { WardrobeNudge } from '@/components/today/wardrobe-nudge';
import {
  buildPersonalizationLine,
  mapGenerateError,
} from '@/lib/today/copy';
import type { WardrobeReadiness } from '@/lib/today/wardrobe-readiness';
import { SLOT_ORDER, type GeneratedOutfit } from '@/lib/types/outfit';

interface OutfitSuggestionProps {
  styleVibes: string[];
  hasLocation: boolean;
  readiness: WardrobeReadiness;
}

export function OutfitSuggestion({
  styleVibes,
  hasLocation,
  readiness,
}: OutfitSuggestionProps) {
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null);
  const [loading, setLoading] = useState(readiness.status === 'ready');
  const [isShuffle, setIsShuffle] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<{ title: string; body: string } | null>(
    null,
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [excludeCombinations, setExcludeCombinations] = useState<string[][]>(
    [],
  );
  const [wornToday, setWornToday] = useState(false);

  const generate = useCallback(async (exclude: string[][] = [], shuffle = false) => {
    setLoading(true);
    setIsShuffle(shuffle);
    setError(null);

    try {
      const res = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeCombinations: exclude }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? 'Something went wrong';
        throw new Error(message);
      }

      setOutfit(data);
      setWornToday(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(mapGenerateError(message));
      if (shuffle) {
        setOutfit(null);
      }
    } finally {
      setLoading(false);
      setIsShuffle(false);
    }
  }, []);

  useEffect(() => {
    if (readiness.status !== 'ready') return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/outfits/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ excludeCombinations: [] }),
        });

        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          const message = data.error ?? 'Something went wrong';
          setError(mapGenerateError(message));
          return;
        }

        setOutfit(data);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Something went wrong';
          setError(mapGenerateError(message));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [readiness.status]);

  async function handleShuffle() {
    if (!outfit) return;
    const nextExclude = [...excludeCombinations, outfit.item_ids];
    setExcludeCombinations(nextExclude);
    await generate(nextExclude, true);
  }

  async function handleWear() {
    if (!outfit) return;
    setActionLoading(true);

    const res = await fetch('/api/outfits/wear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds: outfit.item_ids }),
    });

    setActionLoading(false);

    if (!res.ok) {
      toast.error("Couldn't log that — try again");
      return;
    }

    setWornToday(true);
    toast.success("You're set for today");
  }

  if (readiness.status !== 'ready') {
    return <WardrobeNudge readiness={readiness} />;
  }

  if (loading) {
    return <OutfitGeneratingLoader variant={isShuffle ? 'shuffle' : 'initial'} />;
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-stone-200/60">
        <p className="text-lg font-semibold text-stone-900">{error.title}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
          {error.body}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="rounded-xl"
            onClick={() => generate(excludeCombinations, false)}
          >
            Try again
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl text-stone-600"
            render={<Link href="/wardrobe/add" />}
          >
            Add to wardrobe
          </Button>
        </div>
      </div>
    );
  }

  if (!outfit) return null;

  const sortedItems = SLOT_ORDER.flatMap((slot) => {
    const itemId = outfit.slots[slot];
    if (!itemId) return [];
    const item = outfit.items.find((i) => i.id === itemId);
    return item ? [item] : [];
  });

  const contextLine = buildPersonalizationLine(
    styleVibes,
    outfit.weather,
    hasLocation,
  );

  return (
    <div className="space-y-6">
      <SaveOutfitDialog
        outfit={outfit}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />

      <p className="text-center text-sm text-stone-500">{contextLine}</p>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/60">
        <div className="grid grid-cols-2 gap-px bg-stone-100">
          {sortedItems.map((item) => (
            <div key={item.id} className="relative aspect-3/4 bg-stone-100">
              <Image
                src={outfit.imageUrls[item.image_url] ?? ''}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
        <div className="px-4 py-4">
          <p className="text-sm leading-relaxed text-stone-600">
            {outfit.rationale}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          size="lg"
          className="h-12 w-full rounded-2xl text-base"
          onClick={handleWear}
          disabled={actionLoading || wornToday}
        >
          {wornToday ? 'Logged for today' : 'Wear this'}
        </Button>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try another look
          </button>
          <span className="text-stone-300">·</span>
          <button
            type="button"
            onClick={() => setSaveDialogOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-800"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Save for later
          </button>
        </div>
      </div>

      {!hasLocation && (
        <p className="text-center text-xs text-stone-400">
          <Link href="/profile" className="underline underline-offset-2">
            Add your location
          </Link>{' '}
          for weather-aware picks
        </p>
      )}
    </div>
  );
}
