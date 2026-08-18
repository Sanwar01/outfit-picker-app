import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

export function AuthDivider({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkFaint,
  },
});
