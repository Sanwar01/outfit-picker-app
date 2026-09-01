import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";
import {
  archiveClothingItem,
  getClothingItem,
  restoreClothingItem,
  updateClothingItem,
} from "@/lib/wardrobe-items";
import type { SavedOutfit } from "@shared/types/outfit";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import {
  draftReviewColorSeasonLine,
  draftReviewMetaLine,
} from "@shared/wardrobe/draft-review";
import { formatLastWorn } from "@shared/wardrobe/wardrobe-display";
import { colors, fonts } from "@/lib/theme";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ClothingDraftResponse | null>(null);
  const [outfitCount, setOutfitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const [itemResult, outfitsResult] = await Promise.all([
      getClothingItem(id),
      apiGet<SavedOutfit[]>(`/api/outfits?itemId=${encodeURIComponent(id)}`),
    ]);

    setLoading(false);

    if (!itemResult.ok) {
      setError(itemResult.error);
      setItem(null);
      return;
    }

    setItem(itemResult.data);
    setOutfitCount(outfitsResult.ok ? outfitsResult.data.length : 0);
    setError(null);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleFavorite() {
    if (!item || updatingFavorite) return;
    setUpdatingFavorite(true);
    const result = await updateClothingItem(item.id, {
      is_favorite: !item.is_favorite,
    });
    setUpdatingFavorite(false);

    if (!result.ok) {
      Alert.alert("Couldn't update favourite", result.error);
      return;
    }

    setItem(result.data);
  }

  async function handleArchiveToggle() {
    if (!item) return;

    const isArchived = item.status === "archived";
    const title = isArchived ? "Restore item?" : "Archive item?";
    const message = isArchived
      ? "This item will appear in your wardrobe again."
      : "It will be hidden from recommendations but kept in Archived.";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: isArchived ? "Restore" : "Archive",
        style: isArchived ? "default" : "destructive",
        onPress: () => {
          void (async () => {
            const result = isArchived
              ? await restoreClothingItem(item.id)
              : await archiveClothingItem(item.id);

            if (!result.ok) {
              Alert.alert("Couldn't update item", result.error);
              return;
            }

            if (isArchived) {
              setItem(result.data);
              return;
            }

            router.back();
          })();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  if (error || !item) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load item</Text>
        <Text style={styles.errorBody}>{error ?? "Item not found."}</Text>
        <Button title="Go back" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  const lastWorn = formatLastWorn(item.last_worn_at);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={() => void toggleFavorite()} hitSlop={12}>
            <Ionicons
              name={item.is_favorite ? "heart" : "heart-outline"}
              size={22}
              color={item.is_favorite ? colors.brand : colors.ink}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/wardrobe/item-edit/${item.id}`)}
            hitSlop={12}
          >
            <Ionicons name="create-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Image
          source={{ uri: item.signedImageUrl }}
          style={styles.hero}
          accessibilityLabel={item.name}
          alt={item.name}
        />

        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.meta}>{draftReviewMetaLine(item)}</Text>
        <Text style={styles.meta}>{draftReviewColorSeasonLine(item)}</Text>

        {item.brand ? <Text style={styles.detail}>Brand · {item.brand}</Text> : null}
        {item.material ? (
          <Text style={styles.detail}>Material · {item.material}</Text>
        ) : null}
        {item.size ? <Text style={styles.detail}>Size · {item.size}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.wear_count}</Text>
            <Text style={styles.statLabel}>Times worn</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{outfitCount}</Text>
            <Text style={styles.statLabel}>Saved outfits</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{lastWorn ?? "—"}</Text>
            <Text style={styles.statLabel}>Last worn</Text>
          </View>
        </View>

        {item.exclude_from_recommendations ? (
          <Text style={styles.note}>Excluded from outfit recommendations</Text>
        ) : null}

        {item.status === "archived" ? (
          <Button
            title="Restore to wardrobe"
            onPress={() => void handleArchiveToggle()}
            style={styles.action}
          />
        ) : (
          <Button
            title="Archive item"
            variant="outline"
            onPress={() => void handleArchiveToggle()}
            style={styles.action}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  content: {
    paddingBottom: 32,
    gap: 8,
  },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  meta: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  detail: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    textAlign: "center",
  },
  note: {
    marginTop: 8,
    fontSize: 13,
    color: colors.brand,
    fontFamily: fonts.sansMedium,
  },
  action: {
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  errorBody: {
    textAlign: "center",
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    marginBottom: 8,
  },
});
