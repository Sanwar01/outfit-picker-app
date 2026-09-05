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
import { Screen } from "@/components/atoms";
import { useAuth } from "@/lib/auth-context";
import { useWardrobeScreenQuery } from "@/lib/queries/wardrobe";
import type { FilterValue } from "@shared/types/clothing";
import {
  prepareWardrobeList,
  type WardrobeSortValue,
} from "@shared/wardrobe/wardrobe-display";
import { colors, spacing } from "@/lib/theme";
import { useUsageSnapshotQuery } from "@/lib/queries/billing";
import type { ClothingItem } from "@shared/types/database";
import { WardrobeEmptyState } from "../../sections/wardrobe-empty-state";
import { WardrobeGridCard } from "../../sections/wardrobe-grid-card";
import { WardrobeListHeader } from "../../sections/wardrobe-list-header";
import { GRID_GAP, styles } from "./wardrobe-list-screen.styles";

const EMPTY_ITEMS: ClothingItem[] = [];
const EMPTY_URLS: Record<string, string> = {};

export function WardrobeListScreen() {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - spacing.screen * 2 - GRID_GAP) / 2;

  const [filter, setFilter] = useState<FilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<WardrobeSortValue>("recent");

  const { data, error, isLoading, isFetching, refetch } =
    useWardrobeScreenQuery(user?.id);
  const { data: usage } = useUsageSnapshotQuery(Boolean(user?.id));

  const items = useMemo(() => data?.items ?? EMPTY_ITEMS, [data?.items]);
  const urls = data?.urls ?? EMPTY_URLS;
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
    !isLoading &&
    !loadError &&
    activeCount === 0 &&
    filter === "all" &&
    !searchQuery;

  function emptyMessage(): string {
    if (searchQuery.trim()) {
      return "No items match your search.";
    }
    if (filter === "archived") {
      return "No archived items yet.";
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
          <WardrobeListHeader
            activeCount={activeCount}
            usage={usage}
            loadError={loadError}
            draftCount={draftCount}
            hasWardrobeItems={hasWardrobeItems}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
          />
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
