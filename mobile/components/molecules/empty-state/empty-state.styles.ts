import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
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
