import { Pressable, Text, View } from "react-native";
import { CachedImage } from "@/components/atoms";
import type { SavedOutfit } from "@shared/types/outfit";
import { displaySavedOutfitName } from "@shared/outfits/saved-outfit-name";
import {
  outfitCardSubtitle,
  pickOutfitHeroItem,
} from "@shared/outfits/outfit-display";
import { styles } from "./outfit-grid-card.styles";

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
