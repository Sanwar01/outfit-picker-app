import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { fetchWardrobe } from "@/lib/today";
import type { ClothingItem } from "@shared/types/database";
import { colors } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

export default function WardrobeScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const wardrobe = await fetchWardrobe(user.id);
    setItems(wardrobe);

    const paths = wardrobe.map((i) => i.image_url);
    if (paths.length === 0) return;

    const { data } = await supabase.storage
      .from("wardrobe-images")
      .createSignedUrls(paths, 3600);

    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      if (row.path && row.signedUrl) map[row.path] = row.signedUrl;
    }
    setUrls(map);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen>
      <ScreenTitle>My Wardrobe</ScreenTitle>
      <ScreenSubtitle>Everything you own, perfectly organised</ScreenSubtitle>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No items yet — tap Add to upload.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/wardrobe/${item.id}`)}
          >
            <Image
              source={{ uri: urls[item.image_url] ?? undefined }}
              style={styles.image}
              accessibilityLabel={item.name}
              alt={item.name}
            />
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 16, paddingBottom: 24 },
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
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.cream,
  },
  name: {
    padding: 10,
    fontSize: 13,
    color: colors.ink,
    fontFamily: "DMSans_500Medium",
  },
  empty: {
    textAlign: "center",
    color: colors.inkMuted,
    marginTop: 40,
    fontFamily: "DMSans_400Regular",
  },
});
