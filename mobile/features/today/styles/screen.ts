import { StyleSheet } from "react-native";
import { colors, fonts, spacing } from "@/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    paddingHorizontal: spacing.screen,
    gap: 20,
  },
  header: {
    marginBottom: 0,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
