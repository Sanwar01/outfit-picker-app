import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { CategoryFilterChips } from "@/components/wardrobe/category-filter-chips";
import { DraftsBanner } from "@/components/wardrobe/drafts-banner";
import { WardrobeEmptyState } from "@/components/wardrobe/wardrobe-empty-state";
import { WardrobeGridCard } from "@/components/wardrobe/wardrobe-grid-card";
import { WardrobeSearchBar } from "@/components/wardrobe/wardrobe-search-bar";
import { WardrobeSortChips } from "@/components/wardrobe/wardrobe-sort-chips";
import { useAuth } from "@/lib/auth-context";
import { useWardrobeScreenQuery } from "@/lib/queries/wardrobe";
import type { FilterValue } from "@/lib/wardrobe-items";
import {
  prepareWardrobeList,
  wardrobeSummaryLine,
  type WardrobeSortValue,
} from "@shared/wardrobe/wardrobe-display";
import { colors, fonts, spacing } from "@/lib/theme";

const GRID_GAP = 12;

export default function WardrobeScreen() {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - spacing.screen * 2 - GRID_GAP) / 2;

  const [filter, setFilter] = useState<FilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<WardrobeSortValue>("recent");

  const { data, error, isLoading, isFetching, refetch } = useWardrobeScreenQuery(
    user?.id,
  );

  const items = data?.items ?? [];
  const urls = data?.urls ?? {};
  const draftCount = data?.draftCount ?? 0;
  const loadError = error instanceof Error ? error.message : null;

  const activeCount = useMemo(
    () => items.filter((item) => item.status === "active").length,
    [items],
  );

  const filteredItems = useMemo(
    () => prepareWardrobeList(items, filter, searchQuery, sort),
    [items, filter, searchQuery, sort],
  );

  const hasWardrobeItems = items.length > 0;
  const showEmptyState =
    !isLoading && !loadError && activeCount === 0 && filter === "all" && !searchQuery;

  function emptyMessage(): string {
    if (searchQuery.trim()) {
      return "No items match your search.";
    }
    if (filter === "archived") {
      return "No archived items yet.";
    }
    if (filter !== "all") {
      return "No items in this category yet.";
    }
    return "No items in this category yet.";
  }

  return (
    <Screen>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={filteredItems}
        keyExtractor={(item) => item.id}
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
            <ScreenTitle>My Wardrobe</ScreenTitle>
            <ScreenSubtitle>Everything you own, perfectly organised</ScreenSubtitle>
            <Text style={styles.summary}>{wardrobeSummaryLine(activeCount)}</Text>
            {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
            <DraftsBanner count={draftCount} />
            {hasWardrobeItems ? (
              <>
                <WardrobeSearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <View style={styles.controls}>
                  <Text style={styles.controlLabel}>Category</Text>
                  <CategoryFilterChips value={filter} onChange={setFilter} />
                  <Text style={styles.controlLabel}>Sort by</Text>
                  <WardrobeSortChips value={sort} onChange={setSort} />
                </View>
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.brand} size="large" />
            </View>
          ) : showEmptyState ? (
            <WardrobeEmptyState />
          ) : (
            <Text style={styles.filteredEmpty}>{emptyMessage()}</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.cardCell, { width: cardWidth }]}>
            <WardrobeGridCard
              item={item}
              imageUrl={urls[item.image_url]}
              onPress={() => router.push(`/wardrobe/${item.id}`)}
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
  error: {
    marginTop: 8,
    color: colors.destructive,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  controls: {
    marginTop: 8,
    gap: 4,
  },
  controlLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.sansMedium,
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
  },
});
