import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  screen: {
    paddingBottom: 24,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    marginBottom: 8,
  },
  summary: {
    marginTop: 20,
    marginBottom: 8,
    gap: 6,
  },
  summaryRow: {
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    gap: 12,
    backgroundColor: colors.page,
    paddingTop: 12,
  },
  loadingText: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
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
