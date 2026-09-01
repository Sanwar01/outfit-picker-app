import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { DraftCategoryCount } from "@shared/wardrobe/draft-summary";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { Screen } from "@/components/ui/screen";
import { Button, ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { DraftGridCard } from "@/components/wardrobe/draft-grid-card";
import { useAuth } from "@/lib/auth-context";
import { invalidateWardrobeQueries } from "@/lib/queries/invalidate";
import {
  confirmAllClothingDrafts,
  listClothingDrafts,
} from "@/lib/wardrobe-drafts";
import {
  navigateToDraftReview,
  navigateToDraftReviewFromBulk,
  parseReviewQueueParam,
} from "@/lib/review-queue";
import { colors, fonts } from "@/lib/theme";

export default function BulkReviewScreen() {
  const { ids: idsParam } = useLocalSearchParams<{ ids?: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<ClothingDraftResponse[]>([]);
  const [summary, setSummary] = useState<DraftCategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const filterIds = parseReviewQueueParam(idsParam);
    const result = await listClothingDrafts(
      filterIds.length > 0 ? filterIds : undefined,
    );
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setItems(result.data.items);
    setSummary(result.data.summary);
    setError(null);
  }, [idsParam]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleAddAll() {
    if (items.length === 0) return;

    setConfirming(true);
    const result = await confirmAllClothingDrafts(items.map((item) => item.id));
    setConfirming(false);

    if (!result.ok) {
      Alert.alert("Couldn't add items", result.error);
      return;
    }

    invalidateWardrobeQueries(queryClient, user?.id);
    router.replace("/(tabs)/wardrobe");
  }

  function handleReviewOneByOne() {
    if (items.length === 0) return;
    const [first, ...rest] = items.map((item) => item.id);
    navigateToDraftReview(first, rest, items.length);
  }

  function handleClose() {
    if (items.length === 0) {
      router.back();
      return;
    }

    Alert.alert(
      "Leave review?",
      "Your uploaded items are saved as drafts. You can come back to review them later.",
      [
        { text: "Keep reviewing", style: "cancel" },
        { text: "Leave", onPress: () => router.back() },
      ],
    );
  }

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
        <Text style={styles.loadingText}>Loading your items…</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load items</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Button title="Try again" onPress={() => void load()} />
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Nothing to review</Text>
        <Text style={styles.errorBody}>
          Upload photos to see AI-tagged items here.
        </Text>
        <Button title="Go back" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScreenTitle>Review wardrobe</ScreenTitle>
      <ScreenSubtitle>
        {items.length} {items.length === 1 ? "item" : "items"} ready to add.
        Tap any item to check it, or add them all at once.
      </ScreenSubtitle>

      <View style={styles.summary}>
        {summary.map((row) => (
          <Text key={row.category} style={styles.summaryRow}>
            ✓ {row.count} {row.label}
          </Text>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DraftGridCard
            draft={item}
            onPress={() => navigateToDraftReviewFromBulk(item.id)}
          />
        )}
      />

      <View style={styles.footer}>
        <Button
          title={`Add all ${items.length}`}
          loading={confirming}
          onPress={() => void handleAddAll()}
        />
        {items.length > 1 ? (
          <Button
            title="Review one by one"
            variant="outline"
            disabled={confirming}
            onPress={handleReviewOneByOne}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 24,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    marginBottom: 8,
  },
  summary: {
    marginTop: 20,
    marginBottom: 8,
    gap: 6,
  },
  summaryRow: {
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    gap: 12,
    backgroundColor: colors.page,
    paddingTop: 12,
  },
  loadingText: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
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
