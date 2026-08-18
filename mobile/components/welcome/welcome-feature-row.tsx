import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { WelcomeFeatureIcon } from "@/lib/brand";
import { colors, fonts, radius } from "@/lib/theme";

const ICONS: Record<WelcomeFeatureIcon, keyof typeof Ionicons.glyphMap> = {
  shirt: "shirt-outline",
  sparkles: "sparkles-outline",
  weather: "partly-sunny-outline",
};

type WelcomeFeatureRowProps = {
  icon: WelcomeFeatureIcon;
  title: string;
  body: string;
};

export function WelcomeFeatureRow({ icon, title, body }: WelcomeFeatureRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.tile}>
        <Ionicons name={ICONS[icon]} size={22} color={colors.brand} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radius.tile,
    backgroundColor: colors.creamDeep,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 21,
  },
  body: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkMuted,
  },
});
