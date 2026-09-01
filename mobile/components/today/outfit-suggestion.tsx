import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import {
  checkWardrobeReadiness,
  fetchWardrobe,
  generateOutfit,
  wearOutfit,
  saveOutfit,
} from '@/lib/today';
import type { GeneratedOutfit } from '@shared/types/outfit';
import { colors, fonts } from '@/lib/theme';
import { Button } from '@/components/ui/primitives';
import { WeatherCard } from '@/components/today/weather-card';
import { OutfitCard } from '@/components/today/outfit-card';

const INITIAL_LOADER_MIN_MS = 700;

type GenerateResult =
  | { kind: 'nudge'; itemCount: number }
  | { kind: 'error'; error: string }
  | { kind: 'result'; outfit: GeneratedOutfit };

export function OutfitSuggestion() {
  const { user } = useAuth();
  const userId = user?.id;
  const [wornToday, setWornToday] = useState(false);
  const [wearing, setWearing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const shuffleRef = useRef(false);
  const occasionRef = useRef<string | undefined>(undefined);
  const lastOutfitIdsRef = useRef<string[] | null>(null);
  const hasShownOutfit = useRef(false);
  const loaderStartedAt = useRef(0);

  const query = useQuery({
    queryKey: ['today-outfit', userId],
    enabled: Boolean(userId),
    staleTime: Infinity,
    retry: false,
    queryFn: async (): Promise<GenerateResult> => {
      if (!userId) throw new Error('Not signed in');

      const shuffle = shuffleRef.current;
      const occasion = occasionRef.current;
      loaderStartedAt.current = Date.now();

      const items = await fetchWardrobe(userId);
      const readiness = checkWardrobeReadiness(items);

      if (readiness.status !== 'ready') {
        return {
          kind: 'nudge',
          itemCount: readiness.status === 'empty' ? 0 : readiness.itemCount,
        };
      }

      const excluded =
        shuffle && lastOutfitIdsRef.current ? [lastOutfitIdsRef.current] : [];
      const result = await generateOutfit(excluded, occasion);

      if (!result.ok) {
        return { kind: 'error', error: result.error };
      }

      if (!shuffle && !hasShownOutfit.current) {
        const elapsed = Date.now() - loaderStartedAt.current;
        const remaining = INITIAL_LOADER_MIN_MS - elapsed;
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      }

      lastOutfitIdsRef.current = result.outfit.item_ids;
      hasShownOutfit.current = true;
      return { kind: 'result', outfit: result.outfit };
    },
  });

  function runGenerate(shuffle = false, occasion?: string) {
    shuffleRef.current = shuffle;
    if (occasion !== undefined) {
      occasionRef.current = occasion;
    }
    setWornToday(false);
    setSaved(false);
    void query.refetch();
  }

  async function handleWear() {
    const outfit = query.data?.kind === 'result' ? query.data.outfit : null;
    if (!outfit) return;
    setWearing(true);
    const result = await wearOutfit(outfit.item_ids);
    setWearing(false);
    if (result.ok) setWornToday(true);
  }

  async function handleSave() {
    const outfit = query.data?.kind === 'result' ? query.data.outfit : null;
    if (!outfit || saved) return;
    setSaving(true);
    const result = await saveOutfit(outfit);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      return;
    }
    Alert.alert("Couldn't save that outfit", result.error);
  }

  if (!userId || query.isPending || query.isFetching) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Styling today&apos;s outfit</Text>
        <Text style={styles.stateBody}>
          Curated for you — not just generated
        </Text>
        <ActivityIndicator color={colors.brand} style={styles.spinner} />
      </View>
    );
  }

  if (query.data?.kind === 'nudge') {
    const isEmpty = query.data.itemCount === 0;
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>
          {isEmpty ? "Let's build your closet" : "You're close"}
        </Text>
        <Text style={styles.stateBody}>
          {isEmpty
            ? "Snap a few pieces you wear often — tops, bottoms, and shoes. I'll start suggesting outfits."
            : 'Add a top, bottom, and shoes so I can put a full look together.'}
        </Text>
        <Button
          title={isEmpty ? 'Add your first items' : 'Add clothes'}
          onPress={() => router.push('/wardrobe/add')}
          style={styles.stateBtn}
        />
      </View>
    );
  }

  const errorMessage =
    query.data?.kind === 'error'
      ? query.data.error
      : query.isError
        ? 'Give it another try, or add a few more pieces to your wardrobe.'
        : null;

  if (errorMessage) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Couldn&apos;t put a look together</Text>
        <Text style={styles.stateBody}>{errorMessage}</Text>
        <Button
          title="Try again"
          onPress={() => runGenerate(false)}
          style={styles.stateBtn}
        />
      </View>
    );
  }

  if (query.data?.kind !== 'result') return null;

  const outfit = query.data.outfit;

  return (
    <View style={styles.content}>
      {outfit.weather && <WeatherCard weather={outfit.weather} />}

      <OutfitCard
        outfit={outfit}
        wornToday={wornToday}
        wearing={wearing}
        saved={saved}
        saving={saving}
        onWear={handleWear}
        onSave={() => void handleSave()}
        onShuffle={() => runGenerate(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  stateTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },
  spinner: {
    marginTop: 24,
  },
  stateBtn: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
