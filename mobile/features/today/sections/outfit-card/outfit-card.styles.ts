import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  sectionSub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginTop: 2,
  },
  body: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  heroWrap: {
    width: '48%',
    position: 'relative',
  },
  hero: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  heroPlaceholder: {
    aspectRatio: 3 / 4,
  },
  shuffleChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  shuffleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
  },
  itemList: {
    flex: 1,
    gap: 14,
    paddingTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  thumbPlaceholder: {
    backgroundColor: colors.creamDeep,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink,
  },
  itemBrand: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkFaint,
    marginTop: 2,
  },
  why: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  whyTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: 2,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  whyIcon: {
    marginTop: 2,
  },
  whyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
});
