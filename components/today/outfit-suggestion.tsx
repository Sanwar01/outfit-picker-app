'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bookmark, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { OccasionPicker } from '@/components/today/occasion-picker';
import { OutfitGeneratingLoader } from '@/components/today/outfit-generating-loader';
import { SaveOutfitDialog } from '@/components/today/save-outfit-dialog';
import { WardrobeNudge } from '@/components/today/wardrobe-nudge';
import { mapGenerateError } from '@/lib/today/copy';
import { occasionLabel, type OccasionId } from '@/lib/today/occasions';
import type { WardrobeReadiness } from '@/lib/today/wardrobe-readiness';
import { SLOT_ORDER, type GeneratedOutfit } from '@/lib/types/outfit';
import type { WeatherSnapshot } from '@/lib/weather/open-meteo';

type View = 'picker' | 'loading' | 'result' | 'error';

interface OutfitSuggestionProps {
  styleVibes: string[];
  hasLocation: boolean;
  readiness: WardrobeReadiness;
  weather: WeatherSnapshot;
}

export function OutfitSuggestion({
  styleVibes,
  hasLocation,
  readiness,
  weather,
}: OutfitSuggestionProps) {
  const [view, setView] = useState<View>('picker');
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
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

  const generate = useCallback(
    async (occasionId: OccasionId, exclude: string[][] = [], shuffle = false) => {
      setView('loading');
      setIsShuffle(shuffle);
      setError(null);
      setOccasion(occasionId);

      try {
        const res = await fetch('/api/outfits/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occasion: occasionId,
            excludeCombinations: exclude,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const message = data.error ?? 'Something went wrong';
          throw new Error(message);
        }

        setOutfit(data);
        setWornToday(false);
        setView('result');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(mapGenerateError(message));
        setView('error');
        if (shuffle) {
          setOutfit(null);
        }
      } finally {
        setIsShuffle(false);
      }
    },
    [],
  );

  function handleOccasionSelect(occasionId: OccasionId) {
    setExcludeCombinations([]);
    void generate(occasionId, [], false);
  }

  async function handleShuffle() {
    if (!outfit || !occasion) return;
    const nextExclude = [...excludeCombinations, outfit.item_ids];
    setExcludeCombinations(nextExclude);
    await generate(occasion, nextExclude, true);
  }

  function handleChangePlan() {
    setView('picker');
    setOutfit(null);
    setOccasion(null);
    setError(null);
    setExcludeCombinations([]);
    setWornToday(false);
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

  if (view === 'picker') {
    return (
      <OccasionPicker
        onSelect={handleOccasionSelect}
        styleVibes={styleVibes}
        hasLocation={hasLocation}
        weather={weather}
      />
    );
  }

  if (view === 'loading') {
    return (
      <OutfitGeneratingLoader variant={isShuffle ? 'shuffle' : 'initial'} />
    );
  }

  if (view === 'error' && error) {
    return (
      <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-stone-200/60">
        <p className="text-lg font-semibold text-stone-900">{error.title}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
          {error.body}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {occasion && (
            <Button
              className="rounded-xl"
              onClick={() => generate(occasion, excludeCombinations, false)}
            >
              Try again
            </Button>
          )}
          <Button
            variant="ghost"
            className="rounded-xl text-stone-600"
            onClick={handleChangePlan}
          >
            Change plan
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

  const occasionText =
    outfit.occasion && outfit.occasion !== 'auto'
      ? occasionLabel(outfit.occasion as OccasionId)
      : 'Your look for today';

  return (
    <div className="space-y-6">
      <SaveOutfitDialog
        outfit={outfit}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleChangePlan}
          className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change plan
        </button>
        <span className="text-sm font-medium text-stone-700">{occasionText}</span>
      </div>

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
        <div className="space-y-2 px-4 py-4">
          <p className="text-sm leading-relaxed text-stone-800">
            {outfit.description}
          </p>
          {outfit.rationale && outfit.rationale !== outfit.description && (
            <p className="text-xs text-stone-500">{outfit.rationale}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          size="lg"
          className="h-12 w-full rounded-2xl text-base"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Save outfit
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-12 w-full rounded-2xl border-stone-200 text-base"
          onClick={handleWear}
          disabled={actionLoading || wornToday}
        >
          {wornToday ? 'Logged for today' : 'Wear this'}
        </Button>

        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try another look
          </button>
        </div>
      </div>
    </div>
  );
}
