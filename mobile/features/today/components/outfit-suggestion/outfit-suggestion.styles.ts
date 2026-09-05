import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  quotaHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  stateTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },
  spinner: {
    marginTop: 24,
  },
  stateBtn: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
