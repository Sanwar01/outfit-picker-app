import { useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Screen } from "@/components/atoms";
import { ItemDetailView } from "@/features/wardrobe/components/item-detail-view";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/services/query-client";
import {
  invalidateClothingItemQuery,
  invalidateWardrobeQueries,
} from "@/services/query-invalidate";
import { useClothingItemQuery } from "@/features/wardrobe/hooks/use-wardrobe-queries";
import { useOutfitsByItemCountQuery } from "@/features/outfits/hooks/use-outfit-queries";
import {
  archiveClothingItem,
  restoreClothingItem,
  updateClothingItem,
} from "@/features/wardrobe/api/items";
import { colors } from "@/theme";
import { styles } from "@/features/wardrobe/styles/detail";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: item, error, isLoading } = useClothingItemQuery(id);
  const { data: outfitCount = 0 } = useOutfitsByItemCountQuery(id);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  const loadError = error instanceof Error ? error.message : null;

  function refreshWardrobeCaches(itemId: string) {
    invalidateWardrobeQueries(queryClient, user?.id);
    invalidateClothingItemQuery(queryClient, itemId);
  }

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

    queryClient.setQueryData(queryKeys.wardrobe.item(item.id), result.data);
    refreshWardrobeCaches(item.id);
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

            refreshWardrobeCaches(item.id);

            if (isArchived) {
              queryClient.setQueryData(
                queryKeys.wardrobe.item(item.id),
                result.data,
              );
              return;
            }

            router.back();
          })();
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  if (loadError || !item) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load item</Text>
        <Text style={styles.errorBody}>{loadError ?? "Item not found."}</Text>
        <Button title="Go back" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ItemDetailView
        item={item}
        outfitCount={outfitCount}
        onBack={() => router.back()}
        onToggleFavorite={() => void toggleFavorite()}
        onEdit={() => router.push(`/wardrobe/item-edit/${item.id}`)}
        onArchiveToggle={() => void handleArchiveToggle()}
      />
    </Screen>
  );
}
