import { View, type ViewProps } from "react-native";
import { styles } from "./sheet.styles";

export function Sheet({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.sheet, style]} {...props}>
      {children}
    </View>
  );
}
