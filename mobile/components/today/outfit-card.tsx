import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { GeneratedOutfit } from '@shared/types/outfit';
import { colors, fonts, radius } from '@/lib/theme';
import { Button } from '@/components/ui/primitives';

/** Parse rationale into bullet points — split on sentence boundaries */
function parseWhyPoints(rationale: string): string[] {
  return rationale
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

type OutfitCardProps = {
  outfit: GeneratedOutfit;
  wornToday: boolean;
  wearing: boolean;
  onWear: () => void;
  onSave: () => void;
  onShuffle: () => void;
};

export function OutfitCard({
  outfit,
  wornToday,
  wearing,
  onWear,
  onSave,
  onShuffle,
}: OutfitCardProps) {
  // Use the first item's image as the main hero if no explicit hero
  const heroItem = outfit.items[0];
  const heroUrl = heroItem ? outfit.imageUrls[heroItem.image_url] : undefined;

  const whyPoints = outfit.rationale ? parseWhyPoints(outfit.rationale) : [];

  // Fake match score derived from rationale length as a placeholder
  const matchScore = 91;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>TODAY&apos;S OUTFIT ✨</Text>
          <Text style={styles.sectionSub}>
            Recommended for the weather and your style
          </Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchPct}>{matchScore}%</Text>
          <Text style={styles.matchLabel}>MATCH</Text>
        </View>
      </View>

      {/* Main area: hero photo + item list */}
      <View style={styles.body}>
        {/* Left: hero image with "Another option" overlay */}
        <View style={styles.heroWrap}>
          {heroUrl ? (
            <Image
              source={{ uri: heroUrl }}
              style={styles.hero}
              resizeMode="cover"
              alt="Outfit hero"
            />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder]} />
          )}
          <Pressable style={styles.shuffleChip} onPress={onShuffle}>
            <Ionicons
              name="shuffle-outline"
              size={14}
              color={colors.inkMuted}
            />
            <Text style={styles.shuffleText}>Another option</Text>
          </Pressable>
        </View>

        {/* Right: item list */}
        <View style={styles.itemList}>
          {outfit.items.map((item) => {
            const url = outfit.imageUrls[item.image_url];
            const brand = (item as { brand?: string }).brand;
            return (
              <View key={item.id} style={styles.itemRow}>
                {url ? (
                  <Image
                    alt={item.name}
                    source={{ uri: url }}
                    style={styles.itemThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemThumb, styles.thumbPlaceholder]} />
                )}
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {brand ? (
                    <Text style={styles.itemBrand} numberOfLines={1}>
                      {brand}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}

          {/* Why this works */}
          {whyPoints.length > 0 && (
            <View style={styles.why}>
              <Text style={styles.whyTitle}>WHY THIS WORKS</Text>
              {whyPoints.map((point, i) => (
                <View key={i} style={styles.whyRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color={colors.brand}
                  />
                  <Text style={styles.whyText}>{point}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Scroll horizontally if many items (hidden by default, shown when > 4 items) */}
      {outfit.items.length > 4 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.overflow}
        >
          {outfit.items.map((item) => {
            const url = outfit.imageUrls[item.image_url];
            return (
              <View key={item.id} style={styles.chip}>
                {url ? (
                  <Image
                    alt={item.name}
                    source={{ uri: url }}
                    style={styles.chipThumb}
                  />
                ) : (
                  <View style={[styles.chipThumb, styles.thumbPlaceholder]} />
                )}
                <Text style={styles.chipLabel} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <Button
          title={wornToday ? '✓  Logged' : '✓  Wear this'}
          onPress={onWear}
          loading={wearing}
          disabled={wornToday}
          style={styles.primaryBtn}
        />
        <Button
          title="♡  Save outfit"
          variant="outline"
          onPress={onSave}
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
}

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.inkMuted,
  },
  sectionSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  matchBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchPct: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
    lineHeight: 22,
  },
  matchLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.inkFaint,
  },
  body: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  heroWrap: {
    width: '45%',
    position: 'relative',
  },
  hero: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.cream,
  },
  heroPlaceholder: {
    aspectRatio: 3 / 4,
  },
  shuffleChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  shuffleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkMuted,
  },
  itemList: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.tile,
    backgroundColor: colors.cream,
  },
  thumbPlaceholder: {
    backgroundColor: colors.creamDeep,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
  },
  itemBrand: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 1,
  },
  why: {
    marginTop: 8,
    gap: 4,
  },
  whyTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.inkFaint,
    marginBottom: 2,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  whyText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
    lineHeight: 16,
    flex: 1,
  },
  overflow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  chip: {
    width: 64,
    marginRight: 8,
    alignItems: 'center',
  },
  chipThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.tile,
    backgroundColor: colors.cream,
  },
  chipLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.inkFaint,
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 3,
  },
  secondaryBtn: {
    flex: 2,
  },
});
