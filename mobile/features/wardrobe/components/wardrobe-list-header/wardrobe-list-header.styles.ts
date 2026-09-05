import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

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
  quotaHint: {
    marginTop: 2,
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  error: {
    marginTop: 8,
    color: colors.destructive,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  controls: {
    marginTop: 8,
    gap: 4,
  },
  controlLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.sansMedium,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
