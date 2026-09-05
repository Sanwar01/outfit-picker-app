import { StyleSheet } from "react-native";
import { colors, fonts, radius, spacing } from "@/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 24,
    gap: 22,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
  },
  card: {
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  fieldLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  fieldLabelFollow: {
    marginTop: 14,
  },
  input: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.page,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  errorBox: {
    backgroundColor: "#fdecec",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.destructive,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    backgroundColor: colors.page,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
