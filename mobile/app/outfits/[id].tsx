import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/primitives";
import { CachedImage } from "@/components/ui/cached-image";
import {
  deleteSavedOutfit,
  updateSavedOutfit,
  wearSavedOutfit,
} from "@/lib/outfits";
import { queryKeys } from "@/lib/query-client";
import { useSavedOutfitQuery } from "@/lib/queries/outfits";
import { invalidateOutfitsQueries } from "@/lib/queries/invalidate";
import type { SavedOutfit } from "@shared/types/outfit";
import { displaySavedOutfitName } from "@shared/outfits/saved-outfit-name";
import {
  pickOutfitHeroItem,
  savedOutfitWeatherLine,
} from "@shared/outfits/outfit-display";
import { splitRationaleBullets } from "@shared/outfits/get-outfit";
import { formatLastWorn } from "@shared/wardrobe/wardrobe-display";
import { colors, fonts, radius } from "@/lib/theme";

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: outfit, error, isLoading } = useSavedOutfitQuery(id);
  const [wearing, setWearing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    if (outfit) {
      setNameDraft(displaySavedOutfitName(outfit));
    }
  }, [outfit]);

  const loadError = error instanceof Error ? error.message : null;

  function updateOutfitCache(next: SavedOutfit) {
    queryClient.setQueryData(queryKeys.outfits.detail(id), next);
    invalidateOutfitsQueries(queryClient);
  }

  async function toggleFavorite() {
    if (!outfit) return;

    const result = await updateSavedOutfit(outfit.id, {
      is_favorite: !outfit.is_favorite,
    });

    if (!result.ok) {
      Alert.alert("Couldn't update favourite", result.error);
      return;
    }

    updateOutfitCache({
      ...outfit,
      is_favorite: result.data.is_favorite,
      name: result.data.name,
    });
  }

  async function saveName() {
    if (!outfit) return;
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Give this outfit a name before saving.");
      return;
    }

    setSavingName(true);
    const result = await updateSavedOutfit(outfit.id, { name: trimmed });
    setSavingName(false);

    if (!result.ok) {
      Alert.alert("Couldn't rename outfit", result.error);
      return;
    }

    updateOutfitCache({ ...outfit, name: result.data.name });
    setEditingName(false);
  }

  async function handleWear() {
    if (!outfit || wearing) return;

    setWearing(true);
    const result = await wearSavedOutfit(outfit);
    setWearing(false);

    if (!result.ok) {
      Alert.alert("Couldn't log outfit", result.error);
      return;
    }

    updateOutfitCache({
      ...outfit,
      last_worn_at: new Date().toISOString(),
    });
    Alert.alert("Logged", "Marked as worn today.");
  }

  function handleDelete() {
    if (!outfit) return;

    Alert.alert(
      "Delete outfit?",
      "This removes the saved outfit. Your clothes stay in your wardrobe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const result = await deleteSavedOutfit(outfit.id);
              if (!result.ok) {
                Alert.alert("Couldn't delete outfit", result.error);
                return;
              }
              invalidateOutfitsQueries(queryClient);
              router.back();
            })();
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  if (loadError || !outfit) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load outfit</Text>
        <Text style={styles.errorBody}>{loadError ?? "Outfit not found."}</Text>
        <Button title="Go back" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  const hero = pickOutfitHeroItem(outfit.items);
  const heroUrl = hero ? outfit.imageUrls[hero.image_url] : undefined;
  const title = displaySavedOutfitName(outfit);
  const weatherLine = savedOutfitWeatherLine(outfit.weather_snapshot);
  const rationaleBullets = splitRationaleBullets(outfit.ai_rationale);
  const lastWorn = formatLastWorn(outfit.last_worn_at ?? null);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={() => void toggleFavorite()} hitSlop={12}>
            <Ionicons
              name={outfit.is_favorite ? "heart" : "heart-outline"}
              size={22}
              color={outfit.is_favorite ? colors.brand : colors.ink}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setNameDraft(displaySavedOutfitName(outfit));
              setEditingName((current) => !current);
            }}
            hitSlop={12}
          >
            <Ionicons name="create-outline" size={22} color={colors.ink} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color={colors.inkMuted} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {editingName ? (
          <View style={styles.renameBlock}>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Outfit name"
              placeholderTextColor={colors.inkFaint}
              style={styles.renameInput}
              autoFocus
            />
            <View style={styles.renameActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setEditingName(false)}
                style={styles.renameButton}
              />
              <Button
                title="Save"
                loading={savingName}
                onPress={() => void saveName()}
                style={styles.renameButton}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}

        {weatherLine ? <Text style={styles.meta}>{weatherLine}</Text> : null}
        {lastWorn ? (
          <Text style={styles.meta}>Last worn {lastWorn}</Text>
        ) : (
          <Text style={styles.meta}>Not worn yet</Text>
        )}

        {heroUrl ? (
          <CachedImage
            source={{ uri: heroUrl }}
            style={styles.hero}
            accessibilityLabel={title}
            alt={title}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.hero, styles.placeholder]} />
        )}

        {rationaleBullets.length > 0 ? (
          <View style={styles.whyBlock}>
            <Text style={styles.sectionTitle}>Why this works</Text>
            {rationaleBullets.map((point) => (
              <View key={point} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Pieces</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.piecesRow}
        >
          {outfit.items.map((item) => {
            const url = outfit.imageUrls[item.image_url];
            return (
              <Pressable
                key={item.id}
                style={styles.chip}
                onPress={() => router.push(`/wardrobe/${item.id}`)}
              >
                {url ? (
                  <CachedImage
                    source={{ uri: url }}
                    style={styles.chipImage}
                    accessibilityLabel={item.name}
                    alt={item.name}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.chipImage, styles.placeholder]} />
                )}
                <Text style={styles.chipName} numberOfLines={2}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Button
          title="Wear this outfit"
          loading={wearing}
          onPress={() => void handleWear()}
          style={styles.wearButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  content: {
    paddingBottom: 32,
    gap: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  meta: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
    marginTop: 8,
  },
  placeholder: {
    backgroundColor: colors.cream,
  },
  whyBlock: {
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bullet: {
    color: colors.brand,
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  piecesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    width: 88,
  },
  chipImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  chipName: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
    fontFamily: fonts.sans,
  },
  wearButton: {
    marginTop: 16,
  },
  renameBlock: {
    gap: 10,
  },
  renameInput: {
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  renameButton: {
    minWidth: 100,
    height: 44,
  },
  errorTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  errorBody: {
    textAlign: "center",
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    marginBottom: 8,
  },
});
