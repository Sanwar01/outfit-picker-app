import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  info: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brand,
    marginBottom: 8,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
  },
});
