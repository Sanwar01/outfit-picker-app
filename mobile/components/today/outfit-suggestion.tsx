import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/lib/auth-context";
import {
  checkWardrobeReadiness,
  fetchWardrobe,
  generateOutfit,
  wearOutfit,
} from "@/lib/today";
import type { GeneratedOutfit } from "@shared/types/outfit";
import { colors } from "@/lib/theme";
import { Button } from "@/components/ui/primitives";

const INITIAL_LOADER_MIN_MS = 700;

type ScreenView = "loading" | "result" | "error" | "nudge";

export function OutfitSuggestion() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<ScreenView>("loading");
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wornToday, setWornToday] = useState(false);
  const [wearing, setWearing] = useState(false);
  const hasShownOutfit = useRef(false);
  const loaderStartedAt = useRef(0);

  const runGenerate = useCallback(
    async (shuffle = false) => {
      if (!user) return;

      setView("loading");
      loaderStartedAt.current = Date.now();

      const items = await fetchWardrobe(user.id);
      const readiness = checkWardrobeReadiness(items);

      if (readiness.status !== "ready") {
        setView("nudge");
        return;
      }

      const result = await generateOutfit(
        shuffle && outfit ? [outfit.item_ids] : [],
      );

      if (!result.ok) {
        setError(result.error);
        setView("error");
        return;
      }

      if (!shuffle && !hasShownOutfit.current) {
        const elapsed = Date.now() - loaderStartedAt.current;
        const remaining = INITIAL_LOADER_MIN_MS - elapsed;
        if (remaining > 0) {
          await new Promise((r) => setTimeout(r, remaining));
        }
      }

      setOutfit(result.outfit);
      setWornToday(false);
      hasShownOutfit.current = true;
      setView("result");
    },
    [user, outfit],
  );

  useEffect(() => {
    void runGenerate(false);
  }, [runGenerate]);

  async function handleWear() {
    if (!outfit) return;
    setWearing(true);
    const result = await wearOutfit(outfit.item_ids);
    setWearing(false);
    if (result.ok) setWornToday(true);
  }

  if (view === "loading") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Styling today&apos;s outfit</Text>
        <Text style={styles.cardTitle}>Putting something together</Text>
        <Text style={styles.cardBody}>
          Curated for you — not just generated
        </Text>
        <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (view === "nudge") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Almost there</Text>
        <Text style={styles.cardBody}>
          Add tops, bottoms, and shoes so we can suggest outfits.
        </Text>
      </View>
    );
  }

  if (view === "error") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Couldn&apos;t generate</Text>
        <Text style={styles.cardBody}>{error}</Text>
        <Button
          title="Try again"
          onPress={() => void runGenerate(false)}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  if (!outfit) return null;

  const hero = outfit.items[0];
  const heroUrl = hero ? outfit.imageUrls[hero.image_url] : undefined;
  const name = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>Today&apos;s outfit ✨</Text>
      <Text style={styles.cardTitle}>Hi, {name}</Text>

      {heroUrl ? (
        <Image source={{ uri: heroUrl }} style={styles.hero} />
      ) : (
        <View style={[styles.hero, styles.heroPlaceholder]} />
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsRow}>
        {outfit.items.map((item) => {
          const url = outfit.imageUrls[item.image_url];
          return (
            <View key={item.id} style={styles.itemChip}>
              {url ? (
                <Image source={{ uri: url }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.heroPlaceholder]} />
              )}
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {outfit.rationale ? (
        <Text style={styles.rationale}>{outfit.rationale}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title={wornToday ? "Logged" : "Wear this"}
          onPress={handleWear}
          loading={wearing}
          disabled={wornToday}
          style={styles.actionBtn}
        />
        <Button
          title="Another option"
          variant="outline"
          onPress={() => void runGenerate(true)}
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.brand,
    fontFamily: "DMSans_600SemiBold",
  },
  cardTitle: {
    fontFamily: "InstrumentSerif_400Regular",
    fontSize: 24,
    color: colors.ink,
    marginTop: 4,
  },
  cardBody: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 8,
    lineHeight: 20,
    fontFamily: "DMSans_400Regular",
  },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    marginTop: 16,
    backgroundColor: colors.cream,
  },
  heroPlaceholder: {
    backgroundColor: colors.cream,
  },
  itemsRow: {
    marginTop: 12,
  },
  itemChip: {
    width: 72,
    marginRight: 8,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  itemName: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
    fontFamily: "DMSans_400Regular",
  },
  rationale: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontFamily: "DMSans_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
  },
});
