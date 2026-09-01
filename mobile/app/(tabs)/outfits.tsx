import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";
import type { SavedOutfit } from "@shared/types/outfit";
import { colors } from "@/lib/theme";

export default function OutfitsScreen() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);

  const load = useCallback(async () => {
    const result = await apiGet<SavedOutfit[]>("/api/outfits");
    if (result.ok) setOutfits(result.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen>
      <ScreenTitle>My Outfits</ScreenTitle>
      <ScreenSubtitle>Outfits from your wardrobe, styled for you</ScreenSubtitle>

      <FlatList
        data={outfits}
        keyExtractor={(o) => o.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Save outfits from Today to see them here.
          </Text>
        }
        renderItem={({ item }) => {
          const hero = item.items[0];
          const url = hero ? item.imageUrls[hero.image_url] : undefined;
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/outfits/${item.id}` as never)}
            >
              {url ? (
                <Image
                  source={{ uri: url }}
                  style={styles.image}
                  accessibilityLabel={item.name ?? "Saved outfit"}
                  alt={item.name ?? "Saved outfit"}
                />
              ) : (
                <View style={[styles.image, styles.placeholder]} />
              )}
              <Text style={styles.name} numberOfLines={1}>
                {item.name ?? "Saved outfit"}
              </Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 16 },
  row: { gap: 12 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: "100%", aspectRatio: 3 / 4 },
  placeholder: { backgroundColor: colors.cream },
  name: {
    padding: 10,
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: colors.ink,
  },
  empty: {
    textAlign: "center",
    color: colors.inkMuted,
    marginTop: 40,
  },
});
