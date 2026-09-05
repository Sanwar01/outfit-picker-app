import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";

export const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  content: {
    paddingBottom: 32,
    gap: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  meta: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
    marginTop: 8,
  },
  placeholder: {
    backgroundColor: colors.cream,
  },
  whyBlock: {
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bullet: {
    color: colors.brand,
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  piecesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    width: 88,
  },
  chipImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  chipName: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
    fontFamily: fonts.sans,
  },
  wearButton: {
    marginTop: 16,
  },
  renameBlock: {
    gap: 10,
  },
  renameInput: {
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  renameButton: {
    minWidth: 100,
    height: 44,
  },
  errorTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  errorBody: {
    textAlign: "center",
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    marginBottom: 8,
  },
});
