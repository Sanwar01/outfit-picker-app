import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/ui/primitives";
import { colors, fonts } from "@/lib/theme";

export function WardrobeEmptyState() {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="shirt-outline" size={32} color={colors.brand} />
      </View>
      <Text style={styles.title}>Your wardrobe is empty</Text>
      <Text style={styles.body}>
        Add photos of your clothes and we&apos;ll tag them automatically so
        Today can suggest outfits.
      </Text>
      <Button
        title="Add your first item"
        onPress={() => router.push("/wardrobe/add")}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: fonts.serif,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    alignSelf: "stretch",
  },
});
