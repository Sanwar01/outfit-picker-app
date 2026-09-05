import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
  },
  headline: {
    marginTop: 28,
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  subheadline: {
    marginTop: 10,
    marginBottom: 28,
    maxWidth: 280,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
