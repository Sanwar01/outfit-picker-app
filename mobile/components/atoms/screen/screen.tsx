import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./screen.styles";

export function Screen({ children, style, ...props }: ViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 88 },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
