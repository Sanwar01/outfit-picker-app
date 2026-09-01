import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { OutfitFilterChips } from "@/components/outfits/outfit-filter-chips";
import { OutfitGridCard } from "@/components/outfits/outfit-grid-card";
import { OutfitsEmptyState } from "@/components/outfits/outfits-empty-state";
import { listSavedOutfits } from "@/lib/outfits";
import type { SavedOutfit } from "@shared/types/outfit";
import {
  filterSavedOutfits,
  outfitsSummaryLine,
  type OutfitListFilter,
} from "@shared/outfits/outfit-display";
import { colors, fonts, spacing } from "@/lib/theme";

const GRID_GAP = 12;

export default function OutfitsScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - spacing.screen * 2 - GRID_GAP) / 2;

  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [filter, setFilter] = useState<OutfitListFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);

    const result = await listSavedOutfits();
    if (result.ok) {
      setOutfits(result.data);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load("initial");
    }, [load]),
  );

  const favoriteCount = useMemo(
    () => outfits.filter((outfit) => outfit.is_favorite).length,
    [outfits],
  );

  const filteredOutfits = useMemo(
    () => filterSavedOutfits(outfits, filter),
    [outfits, filter],
  );

  const showEmptyState = !loading && !loadError && outfits.length === 0;

  return (
    <Screen>
      <FlatList
        data={filteredOutfits}
        keyExtractor={(outfit) => outfit.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load("refresh")}
            tintColor={colors.brand}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenTitle>My Outfits</ScreenTitle>
            <ScreenSubtitle>
              Outfits from your wardrobe, styled for you
            </ScreenSubtitle>
            <Text style={styles.summary}>
              {outfitsSummaryLine(outfits.length, favoriteCount)}
            </Text>
            {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
            {outfits.length > 0 ? (
              <View style={styles.controls}>
                <OutfitFilterChips value={filter} onChange={setFilter} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.brand} size="large" />
            </View>
          ) : showEmptyState ? (
            <OutfitsEmptyState />
          ) : (
            <Text style={styles.filteredEmpty}>
              {filter === "favorites"
                ? "No favourite outfits yet. Tap the heart on an outfit to save it here."
                : "No outfits to show."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.cardCell, { width: cardWidth }]}>
            <OutfitGridCard
              outfit={item}
              onPress={() => router.push(`/outfits/${item.id}` as never)}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 8,
  },
  summary: {
    marginTop: 4,
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  controls: {
    marginTop: 8,
  },
  error: {
    marginTop: 8,
    color: colors.destructive,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    gap: GRID_GAP,
    justifyContent: "flex-start",
  },
  cardCell: {
    marginBottom: 12,
  },
  centered: {
    paddingTop: 48,
    alignItems: "center",
  },
  filteredEmpty: {
    textAlign: "center",
    color: colors.inkMuted,
    marginTop: 40,
    fontFamily: fonts.sans,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
});
