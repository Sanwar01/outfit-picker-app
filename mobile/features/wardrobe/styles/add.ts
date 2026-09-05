import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  actions: { marginTop: 24, gap: 12 },
  quotaHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  progress: {
    marginTop: 16,
    fontSize: 14,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
