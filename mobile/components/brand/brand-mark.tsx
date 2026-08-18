import { StyleSheet, Text, View } from "react-native";
import { HangerLogo } from "@/components/brand/hanger-logo";
import { brand } from "@/lib/brand";
import { colors, fonts } from "@/lib/theme";

type BrandMarkProps = {
  variant?: "inline" | "centered";
};

export function BrandMark({ variant = "inline" }: BrandMarkProps) {
  const isCentered = variant === "centered";

  return (
    <View style={[styles.row, isCentered && styles.centered]}>
      <HangerLogo />
      <View style={isCentered && styles.centeredCopy}>
        <Text style={styles.name}>{brand.name}</Text>
        <Text style={styles.tagline}>{brand.tagline}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  centered: {
    flexDirection: "column",
    gap: 12,
  },
  centeredCopy: {
    alignItems: "center",
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 28,
    color: colors.ink,
  },
  tagline: {
    marginTop: 4,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.brand,
  },
});
