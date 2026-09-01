import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { needsReview } from "@shared/types/clothing";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors, fonts } from "@/lib/theme";

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
      <Image source={{ uri: draft.signedImageUrl }} style={styles.image} />
      {flagged ? <View style={styles.flagDot} /> : null}
      <Text style={styles.name} numberOfLines={2}>
        {draft.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.cream,
  },
  flagDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    padding: 10,
    fontSize: 13,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    minHeight: 52,
  },
});
