import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, radius } from "@/lib/theme";
import { styles } from "./hanger-logo.styles";

export function HangerLogo({ size = 44 }: { size?: number }) {
  const iconSize = Math.round(size * 0.48);

  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: radius.logo },
      ]}
    >
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3.4c1.35 0 2.35.95 2.35 2.2"
          stroke={colors.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M12 5.6v3.1"
          stroke={colors.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M4.8 18.7h14.4"
          stroke={colors.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M4.8 18.7 12 8.8l7.2 9.9"
          stroke={colors.ink}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
