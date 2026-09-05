import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  city: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.ink,
    flexShrink: 1,
  },
  mid: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  tempLine: {
    flex: 1,
    flexShrink: 1,
  },
  temp: {
    fontFamily: fonts.sansSemi,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
  },
  condition: {
    fontFamily: fonts.sans,
    fontSize: 24,
    lineHeight: 30,
    color: colors.inkMuted,
  },
  hilo: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    marginTop: 8,
  },
  precipChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  precipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
  },
});
