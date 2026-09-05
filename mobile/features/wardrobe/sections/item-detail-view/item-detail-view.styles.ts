import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
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
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
    marginBottom: 8,
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
  detail: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    textAlign: "center",
  },
  note: {
    marginTop: 8,
    fontSize: 13,
    color: colors.brand,
    fontFamily: fonts.sansMedium,
  },
  action: {
    marginTop: 16,
  },
});
