import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

const GRID_GAP = 12;

export const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 8,
  },
  summary: {
    marginTop: 4,
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  controls: {
    marginTop: 8,
  },
  error: {
    marginTop: 8,
    color: colors.destructive,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    gap: GRID_GAP,
    justifyContent: "flex-start",
  },
  cardCell: {
    marginBottom: 12,
  },
  centered: {
    paddingTop: 48,
    alignItems: "center",
  },
  filteredEmpty: {
    textAlign: "center",
    color: colors.inkMuted,
    marginTop: 40,
    fontFamily: fonts.sans,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
});
