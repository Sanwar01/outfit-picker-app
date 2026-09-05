import { router } from "expo-router";
import { EmptyState } from "@/components/molecules";

export function WardrobeEmptyState() {
  return (
    <EmptyState
      icon="shirt-outline"
      title="Your wardrobe is empty"
      body="Add photos of your clothes and we'll tag them automatically so Today can suggest outfits."
      actionTitle="Add your first item"
      onAction={() => router.push("/wardrobe/add")}
    />
  );
}
