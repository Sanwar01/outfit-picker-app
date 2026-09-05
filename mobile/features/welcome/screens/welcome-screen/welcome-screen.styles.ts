import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  hero: {
    flex: 1,
    minHeight: "50%",
  },
  brandWrap: {
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 24,
    paddingTop: 28,
    marginTop: -32,
    boxShadow: "0px -8px 30px rgba(0,0,0,0.06)",
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  headlineAccent: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.brand,
  },
  subheadline: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    marginTop: 8,
    marginBottom: 24,
  },
  features: {
    gap: 20,
    marginBottom: 22,
  },
  cta: {
    marginBottom: 16,
  },
  footer: {
    marginBottom: 10,
    alignItems: "center",
  },
});
