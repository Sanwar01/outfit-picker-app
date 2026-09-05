import { StyleSheet } from "react-native";
import { colors, fonts, spacing } from "@/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    marginTop: -8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 10,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.destructive,
  },
});
