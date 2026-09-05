import { Pressable, StyleSheet, Text, View } from "react-native";
import { CachedImage } from "@/components/atoms";
import type { SavedOutfit } from "@shared/types/outfit";
import { displaySavedOutfitName } from "@shared/outfits/saved-outfit-name";
import {
  outfitCardSubtitle,
  pickOutfitHeroItem,
} from "@shared/outfits/outfit-display";
import { colors, fonts } from "@/lib/theme";

type OutfitGridCardProps = {
  outfit: SavedOutfit;
  onPress: () => void;
};

export function OutfitGridCard({ outfit, onPress }: OutfitGridCardProps) {
  const hero = pickOutfitHeroItem(outfit.items);
  const url = hero ? outfit.imageUrls[hero.image_url] : undefined;
  const title = displaySavedOutfitName(outfit);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {url ? (
        <CachedImage
          source={{ uri: url }}
          style={styles.image}
          accessibilityLabel={title}
          alt={title}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      {outfit.is_favorite ? (
        <View style={styles.favoriteBadge}>
          <Text style={styles.favoriteText}>★</Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {outfitCardSubtitle(outfit)}
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
