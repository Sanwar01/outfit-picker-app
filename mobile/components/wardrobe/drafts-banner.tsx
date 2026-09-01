import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts } from "@/lib/theme";

type DraftsBannerProps = {
  count: number;
};

export function DraftsBanner({ count }: DraftsBannerProps) {
  if (count <= 0) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
      onPress={() => router.push("/wardrobe/bulk-review")}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>
          {count} item{count === 1 ? "" : "s"} waiting for review
        </Text>
        <Text style={styles.body}>Tap to finish adding them to your wardrobe</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.brand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.brandSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.92,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  body: {
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
