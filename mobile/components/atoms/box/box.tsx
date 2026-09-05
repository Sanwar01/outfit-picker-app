import { View, type ViewProps, type ViewStyle } from "react-native";
import { styles } from "./box.styles";

type BoxProps = ViewProps & {
  padding?: number;
  gap?: number;
  radius?: number;
  background?: string;
  flex?: number;
  row?: boolean;
};

export function Box({
  padding,
  gap,
  radius,
  background,
  flex,
  row,
  style,
  ...props
}: BoxProps) {
  const extras: ViewStyle = {
    ...(padding != null ? { padding } : null),
    ...(gap != null ? { gap } : null),
    ...(radius != null ? { borderRadius: radius } : null),
    ...(background != null ? { backgroundColor: background } : null),
    ...(flex != null ? { flex } : null),
  };

  return <View style={[row && styles.row, extras, style]} {...props} />;
}
