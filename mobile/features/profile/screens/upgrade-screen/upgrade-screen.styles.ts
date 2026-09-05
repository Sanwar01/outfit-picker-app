import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  backText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.ink,
  },
  priceCard: {
    backgroundColor: colors.cream,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    alignItems: "flex-start",
    gap: 4,
  },
  priceLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  price: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 40,
    color: colors.ink,
  },
  pricePeriod: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
  benefits: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 14,
  },
  benefitRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitCopy: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.ink,
  },
  benefitBody: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  footnote: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
