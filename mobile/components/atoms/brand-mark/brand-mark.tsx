import { Text, View } from "react-native";
import { HangerLogo } from "../hanger-logo";
import { brand } from "@/theme/brand";
import { styles } from "./brand-mark.styles";

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
