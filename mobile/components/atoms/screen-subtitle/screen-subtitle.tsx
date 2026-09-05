import { Text, type TextStyle } from "react-native";
import type { ReactNode } from "react";
import { styles } from "./screen-subtitle.styles";

export function ScreenSubtitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}
