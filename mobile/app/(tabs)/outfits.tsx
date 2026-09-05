import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { Screen, ScreenSubtitle, ScreenTitle } from "@/components/atoms";
import { OutfitFilterChips } from "@/features/outfits/components/outfit-filter-chips";
import { OutfitGridCard } from "@/features/outfits/components/outfit-grid-card";
import { OutfitsEmptyState } from "@/features/outfits/components/outfits-empty-state";
import { useSavedOutfitsQuery } from "@/features/outfits/hooks/use-outfit-queries";
import {
  filterSavedOutfits,
  outfitsSummaryLine,
  type OutfitListFilter,
} from "@shared/outfits/outfit-display";
import { colors, spacing } from "@/theme";
import { styles } from "@/features/outfits/styles/list";

const GRID_GAP = 12;

export default function OutfitsListScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - spacing.screen * 2 - GRID_GAP) / 2;

  const [filter, setFilter] = useState<OutfitListFilter>("all");

  const { data: outfits = [], error, isLoading, isFetching, refetch } =
    useSavedOutfitsQuery();

  const loadError = error instanceof Error ? error.message : null;

  const favoriteCount = useMemo(
    () => outfits.filter((outfit) => outfit.is_favorite).length,
    [outfits],
  );

  const filteredOutfits = useMemo(
    () => filterSavedOutfits(outfits, filter),
    [outfits, filter],
  );

  const showEmptyState = !isLoading && !loadError && outfits.length === 0;

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
            refreshing={isFetching && !isLoading}
            onRefresh={() => void refetch()}
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
          isLoading ? (
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
