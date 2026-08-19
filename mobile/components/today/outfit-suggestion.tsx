import { useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  checkWardrobeReadiness,
  fetchWardrobe,
  generateOutfit,
  wearOutfit,
} from "@/lib/today";
import type { GeneratedOutfit } from "@shared/types/outfit";
import { colors, fonts } from "@/lib/theme";
import { Button } from "@/components/ui/primitives";
import { WeatherCard } from "@/components/today/weather-card";
import { OutfitCard } from "@/components/today/outfit-card";
import { OccasionPicker } from "@/components/today/occasion-picker";

const INITIAL_LOADER_MIN_MS = 700;

type GenerateResult =
  | { kind: "nudge" }
  | { kind: "error"; error: string }
  | { kind: "result"; outfit: GeneratedOutfit };

export function OutfitSuggestion() {
  const { user } = useAuth();
  const userId = user?.id;
  const [wornToday, setWornToday] = useState(false);
  const [wearing, setWearing] = useState(false);
  const shuffleRef = useRef(false);
  const occasionRef = useRef<string | undefined>(undefined);
  const lastOutfitIdsRef = useRef<string[] | null>(null);
  const hasShownOutfit = useRef(false);
  const loaderStartedAt = useRef(0);

  const query = useQuery({
    queryKey: ["today-outfit", userId],
    enabled: Boolean(userId),
    staleTime: Infinity,
    retry: false,
    queryFn: async (): Promise<GenerateResult> => {
      if (!userId) throw new Error("Not signed in");

      const shuffle = shuffleRef.current;
      const occasion = occasionRef.current;
      loaderStartedAt.current = Date.now();

      const items = await fetchWardrobe(userId);
      const readiness = checkWardrobeReadiness(items);

      if (readiness.status !== "ready") {
        return { kind: "nudge" };
      }

      const excluded =
        shuffle && lastOutfitIdsRef.current ? [lastOutfitIdsRef.current] : [];
      const result = await generateOutfit(excluded, occasion);

      if (!result.ok) {
        return { kind: "error", error: result.error };
      }

      if (!shuffle && !hasShownOutfit.current) {
        const elapsed = Date.now() - loaderStartedAt.current;
        const remaining = INITIAL_LOADER_MIN_MS - elapsed;
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      }

      lastOutfitIdsRef.current = result.outfit.item_ids;
      hasShownOutfit.current = true;
      return { kind: "result", outfit: result.outfit };
    },
  });

  function runGenerate(shuffle = false, occasion?: string) {
    shuffleRef.current = shuffle;
    occasionRef.current = occasion;
    setWornToday(false);
    void query.refetch();
  }

  async function handleWear() {
    const outfit =
      query.data?.kind === "result" ? query.data.outfit : null;
    if (!outfit) return;
    setWearing(true);
    const result = await wearOutfit(outfit.item_ids);
    setWearing(false);
    if (result.ok) setWornToday(true);
  }

  function handleSave() {
    // Save outfit — to be wired to saved outfits API
  }

  if (!userId || query.isPending || query.isFetching) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateEyebrow}>STYLING TODAY&apos;S OUTFIT</Text>
        <Text style={styles.stateTitle}>Putting something together</Text>
        <Text style={styles.stateBody}>Curated for you — not just generated</Text>
        <ActivityIndicator color={colors.brand} style={styles.spinner} />
      </View>
    );
  }

  if (query.data?.kind === "nudge") {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Almost there</Text>
        <Text style={styles.stateBody}>
          Add tops, bottoms, and shoes so we can suggest outfits.
        </Text>
      </View>
    );
  }

  const errorMessage =
    query.data?.kind === "error"
      ? query.data.error
      : query.isError
        ? "Something went wrong"
        : null;

  if (errorMessage) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Couldn&apos;t generate</Text>
        <Text style={styles.stateBody}>{errorMessage}</Text>
        <Button
          title="Try again"
          onPress={() => runGenerate(false)}
          style={styles.retryBtn}
        />
      </View>
    );
  }

  if (query.data?.kind !== "result") return null;

  const outfit = query.data.outfit;

  return (
    <View style={styles.content}>
      {/* Weather card */}
      {outfit.weather && (
        <WeatherCard weather={outfit.weather} />
      )}

      {/* Outfit card */}
      <OutfitCard
        outfit={outfit}
        wornToday={wornToday}
        wearing={wearing}
        onWear={handleWear}
        onSave={handleSave}
        onShuffle={() => runGenerate(true)}
      />

      {/* Occasion picker */}
      <OccasionPicker
        onSelect={(occasionId) => runGenerate(false, occasionId)}
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  stateEyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.brand,
    marginBottom: 6,
  },
  stateTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 6,
  },
  stateBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  spinner: {
    marginTop: 20,
  },
  retryBtn: {
    marginTop: 16,
  },
});
