import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },
  muted: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
  },
  serif: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
  },
});
