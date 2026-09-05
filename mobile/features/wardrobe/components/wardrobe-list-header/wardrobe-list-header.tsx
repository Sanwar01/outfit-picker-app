import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenSubtitle, ScreenTitle } from "@/components/atoms";
import type { FilterValue } from "@shared/types/clothing";
import type { UsageSnapshot } from "@/services/billing";
import { formatUsageFraction } from "@/services/billing";
import { wardrobeSummaryLine, type WardrobeSortValue } from "@shared/wardrobe/wardrobe-display";
import { CategoryFilterChips } from "../category-filter-chips";
import { DraftsBanner } from "../drafts-banner";
import { WardrobeSearchBar } from "../wardrobe-search-bar";
import { WardrobeSortChips } from "../wardrobe-sort-chips";
import { styles } from "./wardrobe-list-header.styles";

type WardrobeListHeaderProps = {
  activeCount: number;
  usage?: UsageSnapshot;
  loadError: string | null;
  draftCount: number;
  hasWardrobeItems: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  sort: WardrobeSortValue;
  onSortChange: (value: WardrobeSortValue) => void;
};

export function WardrobeListHeader({
  activeCount,
  usage,
  loadError,
  draftCount,
  hasWardrobeItems,
  searchQuery,
  onSearchQueryChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: WardrobeListHeaderProps) {
  return (
    <View style={styles.header}>
      <ScreenTitle>My Wardrobe</ScreenTitle>
      <ScreenSubtitle>Everything you own, perfectly organised</ScreenSubtitle>
      <Text style={styles.summary}>{wardrobeSummaryLine(activeCount)}</Text>
      {usage?.wardrobe.limit != null ? (
        <Pressable
          onPress={() => {
            if (usage.plan === "free") router.push("/profile/upgrade");
          }}
          disabled={usage.plan !== "free"}
        >
          <Text style={styles.quotaHint}>
            Plan limit {formatUsageFraction(usage.wardrobe)}
            {usage.wardrobe.remaining === 0
              ? " — archive items to free space"
              : ""}
            {usage.plan === "free" &&
            usage.wardrobe.used / usage.wardrobe.limit >= 0.7
              ? " · Upgrade for more room"
              : ""}
          </Text>
        </Pressable>
      ) : null}
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      <DraftsBanner count={draftCount} />
      {hasWardrobeItems ? (
        <>
          <WardrobeSearchBar
            value={searchQuery}
            onChangeText={onSearchQueryChange}
          />
          <View style={styles.controls}>
            <Text style={styles.controlLabel}>Category</Text>
            <CategoryFilterChips value={filter} onChange={onFilterChange} />
            <Text style={styles.controlLabel}>Sort by</Text>
            <WardrobeSortChips value={sort} onChange={onSortChange} />
          </View>
        </>
      ) : null}
    </View>
  );
}
