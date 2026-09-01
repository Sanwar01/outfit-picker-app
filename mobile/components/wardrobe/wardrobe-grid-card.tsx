import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CachedImage } from "@/components/ui/cached-image";
import { needsReview } from "@shared/types/clothing";
import type { ClothingItem } from "@shared/types/database";
import { wardrobeItemSubtitle } from "@shared/wardrobe/wardrobe-display";
import { colors, fonts } from "@/lib/theme";

type WardrobeGridCardProps = {
  item: ClothingItem;
  imageUrl?: string;
  onPress: () => void;
};

export function WardrobeGridCard({
  item,
  imageUrl,
  onPress,
}: WardrobeGridCardProps) {
  const flagged =
    item.name === "Clothing item" ||
    item.tagging_status === "failed" ||
    needsReview(item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {imageUrl ? (
        <CachedImage
          source={{ uri: imageUrl }}
          style={styles.image}
          accessibilityLabel={item.name}
          alt={item.name}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      {item.is_favorite ? (
        <View style={styles.favoriteBadge}>
          <Text style={styles.favoriteText}>★</Text>
        </View>
      ) : null}
      {flagged ? <View style={styles.flagDot} /> : null}
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {wardrobeItemSubtitle(item)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.cream,
  },
  placeholder: {
    backgroundColor: colors.cream,
  },
  favoriteBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteText: {
    fontSize: 12,
    color: colors.brand,
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
  copy: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 2,
    minHeight: 52,
  },
  name: {
    fontSize: 13,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
  },
  subtitle: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
