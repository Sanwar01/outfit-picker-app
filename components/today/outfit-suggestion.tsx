'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlternateOccasionsRow } from '@/components/today/alternate-occasions-row';
import { OutfitGeneratingLoader } from '@/components/today/outfit-generating-loader';
import { OutfitRecommendationCard } from '@/components/today/outfit-recommendation-card';
import { SaveOutfitDialog } from '@/components/today/save-outfit-dialog';
import { WardrobeNudge } from '@/components/today/wardrobe-nudge';
import { useQuickEditItemSheet } from '@/components/wardrobe/use-quick-edit-item-sheet';
import { mapGenerateError } from '@/lib/today/copy';
import type { OccasionId } from '@/lib/today/occasions';
import type { WardrobeReadiness } from '@/lib/today/wardrobe-readiness';
import type { GeneratedOutfit } from '@/lib/types/outfit';

type View = 'loading' | 'result' | 'error';

const INITIAL_LOADER_MIN_MS = 700;
const RESULT_FADE_MS = 300;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

interface OutfitSuggestionProps {
  styleVibes: string[];
  readiness: WardrobeReadiness;
  userId: string;
}

export function OutfitSuggestion({
  styleVibes,
  readiness,
  userId,
}: OutfitSuggestionProps) {
  const [view, setView] = useState<View>('loading');
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null);
  const [occasion, setOccasion] = useState<OccasionId>('auto');
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
  const [resultVisible, setResultVisible] = useState(false);
  const initialLoadDone = useRef(false);
  const hasShownOutfit = useRef(false);
  const loaderStartedAt = useRef(0);
  const { openQuickEdit, quickEditSheet } = useQuickEditItemSheet(userId);

  const generate = useCallback(
    async (
      occasionId: OccasionId,
      exclude: string[][] = [],
      shuffle = false,
      resetExclude = false,
    ) => {
      setView('loading');
      setResultVisible(false);
      setIsShuffle(shuffle);
      setError(null);
      setOccasion(occasionId);
      loaderStartedAt.current = Date.now();

      if (resetExclude) {
        setExcludeCombinations([]);
      }

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

        if (!shuffle && !hasShownOutfit.current) {
          const elapsed = Date.now() - loaderStartedAt.current;
          const remaining = INITIAL_LOADER_MIN_MS - elapsed;
          if (remaining > 0) {
            await wait(remaining);
          }
        }

        setOutfit(data);
        setWornToday(false);
        hasShownOutfit.current = true;
        setView('result');
        window.requestAnimationFrame(() => setResultVisible(true));
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

  useEffect(() => {
    if (readiness.status !== 'ready' || initialLoadDone.current) return;
    initialLoadDone.current = true;
    void generate('auto', [], false, true);
  }, [readiness.status, generate]);

  function handleAlternateOccasion(occasionId: OccasionId) {
    void generate(occasionId, [], false, true);
  }

  async function handleShuffle() {
    if (!outfit) return;
    const nextExclude = [...excludeCombinations, outfit.item_ids];
    setExcludeCombinations(nextExclude);
    await generate(occasion, nextExclude, true);
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

  if (view === 'loading') {
    return (
      <OutfitGeneratingLoader
        key={isShuffle ? 'shuffle' : 'initial'}
        variant={isShuffle ? 'shuffle' : 'initial'}
        styleVibes={styleVibes}
      />
    );
  }

  if (view === 'error' && error) {
    return (
      <div className="rounded-3xl border border-border bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-foreground">{error.title}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {error.body}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="rounded-xl"
            onClick={() =>
              generate(occasion, excludeCombinations, false, false)
            }
          >
            Try again
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl text-muted-foreground"
            render={<Link href="/wardrobe/add" />}
          >
            Add to wardrobe
          </Button>
        </div>
      </div>
    );
  }

  if (!outfit) return null;

  return (
    <div
      className="space-y-5 transition-opacity ease-out"
      style={{
        opacity: resultVisible ? 1 : 0,
        transitionDuration: `${RESULT_FADE_MS}ms`,
      }}
    >
      <SaveOutfitDialog
        outfit={outfit}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />

      <OutfitRecommendationCard
        outfit={outfit}
        styleVibes={styleVibes}
        onShuffle={handleShuffle}
        shuffleDisabled={isShuffle}
        onItemClick={(item) =>
          openQuickEdit(item, outfit.imageUrls[item.image_url] ?? '')
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          className="h-12 rounded-2xl bg-primary text-base text-white hover:bg-primary/90"
          onClick={handleWear}
          disabled={actionLoading || wornToday}
        >
          <Check className="mr-2 h-4 w-4" />
          {wornToday ? 'Logged' : 'Wear this'}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-2xl border-border bg-white text-base text-foreground hover:bg-background"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Save outfit
        </Button>
      </div>

      <AlternateOccasionsRow
        activeOccasion={occasion === 'auto' ? null : occasion}
        onSelect={handleAlternateOccasion}
        disabled={isShuffle}
      />

      {quickEditSheet}
    </div>
  );
}
