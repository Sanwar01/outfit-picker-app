import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/atoms";
import { colors, fonts } from "@/lib/theme";

export function OutfitsEmptyState() {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="bookmark-outline" size={32} color={colors.brand} />
      </View>
      <Text style={styles.title}>No saved outfits yet</Text>
      <Text style={styles.body}>
        When you like a look on Today, tap Save outfit. Your favourites will
        show up here.
      </Text>
      <Button
        title="Go to Today"
        onPress={() => router.push("/(tabs)/today")}
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
