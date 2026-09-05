import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { styles } from "./text.styles";

type TextProps = RNTextProps & {
  variant?: "body" | "muted" | "serif";
};

export function Text({ variant = "body", style, ...props }: TextProps) {
  return <RNText style={[styles[variant], style]} {...props} />;
}
