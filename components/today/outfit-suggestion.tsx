'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OutfitGeneratingLoader } from '@/components/today/outfit-generating-loader';
import { SaveOutfitDialog } from '@/components/today/save-outfit-dialog';
import { WeatherHeader } from '@/components/today/weather-header';
import { CATEGORY_LABELS } from '@/lib/types/clothing';
import { SLOT_ORDER, type GeneratedOutfit } from '@/lib/types/outfit';

export function OutfitSuggestion() {
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [excludeCombinations, setExcludeCombinations] = useState<string[][]>(
    [],
  );

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
        throw new Error(data.error ?? 'Failed to generate outfit');
      }

      setOutfit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      if (shuffle) {
        setOutfit(null);
      }
    } finally {
      setLoading(false);
      setIsShuffle(false);
    }
  }, []);

  useEffect(() => {
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
          throw new Error(data.error ?? 'Failed to generate outfit');
        }

        setOutfit(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      toast.error('Failed to log outfit');
      return;
    }

    toast.success('Logged for today — enjoy your outfit!');
  }

  if (loading) {
    return <OutfitGeneratingLoader variant={isShuffle ? 'shuffle' : 'initial'} />;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
          <RefreshCw className="h-5 w-5 text-stone-500" />
        </div>
        <p className="text-sm font-medium text-stone-900">
          Couldn&apos;t build an outfit
        </p>
        <p className="mt-1 text-sm text-stone-500">{error}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => generate(excludeCombinations, false)}
          >
            Try again
          </Button>
          <Link
            href="/wardrobe/add"
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-xl')}
          >
            Add clothes
          </Link>
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

  return (
    <div className="space-y-5">
      <SaveOutfitDialog
        outfit={outfit}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />

      <WeatherHeader weather={outfit.weather} />

      <div className="grid grid-cols-2 gap-3">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="relative aspect-3/4 bg-stone-100">
              <Image
                src={outfit.imageUrls[item.image_url] ?? ''}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-1 p-2.5">
              <p className="truncate text-xs font-medium text-stone-900">
                {item.name}
              </p>
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {CATEGORY_LABELS[item.category]}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-stone-600 shadow-sm">
        {outfit.rationale}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Button
          className="rounded-xl"
          onClick={handleWear}
          disabled={actionLoading}
        >
          Wear this
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={handleShuffle}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Shuffle
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => setSaveDialogOpen(true)}
          disabled={actionLoading}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
