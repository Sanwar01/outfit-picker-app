import { router } from "expo-router";
import { EmptyState } from "@/components/molecules";

export function OutfitsEmptyState() {
  return (
    <EmptyState
      icon="bookmark-outline"
      title="No saved outfits yet"
      body="When you like a look on Today, tap Save outfit. Your favourites will show up here."
      actionTitle="Go to Today"
      onAction={() => router.push("/(tabs)/today")}
    />
  );
}
