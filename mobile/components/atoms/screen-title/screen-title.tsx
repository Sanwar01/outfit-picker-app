import { Text, type TextStyle } from "react-native";
import type { ReactNode } from "react";
import { styles } from "./screen-title.styles";

export function ScreenTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}
