import { Image, Pressable, Text, View } from "react-native";
import { needsReview } from "@shared/types/clothing";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { styles } from "./draft-grid-card.styles";

type DraftGridCardProps = {
  draft: ClothingDraftResponse;
  onPress: () => void;
};

export function DraftGridCard({ draft, onPress }: DraftGridCardProps) {
  const flagged =
    draft.name === "Clothing item" ||
    draft.tagging_status === "failed" ||
    needsReview(draft);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: draft.signedImageUrl }}
        style={styles.image}
        accessibilityLabel={draft.name}
        alt={draft.name}
      />
      {flagged ? <View style={styles.flagDot} /> : null}
      <Text style={styles.name} numberOfLines={2}>
        {draft.name}
      </Text>
    </Pressable>
  );
}
