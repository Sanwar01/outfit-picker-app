import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  progress: {
    marginBottom: 8,
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sansMedium,
  },
  hero: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  title: {
    marginTop: 20,
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
  },
  meta: {
    marginTop: 6,
    fontSize: 15,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: colors.brand,
    fontFamily: fonts.sans,
  },
  prompt: {
    marginTop: 28,
    fontSize: 18,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
});
