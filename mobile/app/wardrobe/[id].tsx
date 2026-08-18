import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/primitives";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { ClothingItem } from "@shared/types/database";
import { colors } from "@/lib/theme";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;

    (async () => {
      const { data } = await supabase
        .from("clothing_items")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (data) {
        setItem(data as ClothingItem);
        const { data: signed } = await supabase.storage
          .from("wardrobe-images")
          .createSignedUrl(data.image_url, 3600);
        setImageUrl(signed?.signedUrl ?? null);
      }
    })();
  }, [user, id]);

  if (!item) {
    return (
      <Screen>
        <Text style={styles.loading}>Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.hero} />
      ) : (
        <View style={[styles.hero, styles.placeholder]} />
      )}
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.meta}>{item.brand ?? item.category}</Text>
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
  loading: { color: colors.inkMuted },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  placeholder: { backgroundColor: colors.cream },
  title: {
    marginTop: 16,
    fontFamily: "InstrumentSerif_400Regular",
    fontSize: 28,
    color: colors.ink,
  },
  meta: {
    marginTop: 4,
    color: colors.inkMuted,
    fontFamily: "DMSans_400Regular",
  },
});
