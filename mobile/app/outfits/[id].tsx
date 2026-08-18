import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";
import type { SavedOutfit } from "@shared/types/outfit";
import { colors } from "@/lib/theme";

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [outfit, setOutfit] = useState<SavedOutfit | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const result = await apiGet<SavedOutfit>(`/api/outfits/${id}`);
      if (result.ok) setOutfit(result.data);
    })();
  }, [id]);

  if (!outfit) {
    return (
      <Screen>
        <Text style={{ color: colors.inkMuted }}>Loading…</Text>
      </Screen>
    );
  }

  const hero = outfit.items[0];
  const heroUrl = hero ? outfit.imageUrls[hero.image_url] : undefined;

  return (
    <Screen>
      <Text style={styles.title}>{outfit.name ?? "Saved outfit"}</Text>
      {heroUrl ? (
        <Image source={{ uri: heroUrl }} style={styles.hero} />
      ) : (
        <View style={[styles.hero, styles.placeholder]} />
      )}

      {outfit.ai_rationale ? (
        <Text style={styles.rationale}>{outfit.ai_rationale}</Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {outfit.items.map((item) => {
          const url = outfit.imageUrls[item.image_url];
          return (
            <View key={item.id} style={styles.chip}>
              {url ? (
                <Image source={{ uri: url }} style={styles.chipImage} />
              ) : null}
              <Text style={styles.chipName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Button
        title="Back"
        variant="outline"
        onPress={() => router.back()}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "InstrumentSerif_400Regular",
    fontSize: 28,
    color: colors.ink,
    marginBottom: 12,
  },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
  },
  placeholder: { backgroundColor: colors.cream },
  rationale: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontFamily: "DMSans_400Regular",
  },
  chip: { width: 80, marginRight: 8 },
  chipImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  chipName: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
