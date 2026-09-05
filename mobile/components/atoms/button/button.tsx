import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { colors } from "@/theme";
import { styles } from "./button.styles";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
};

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isPrimary && styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style as ViewStyle,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.primaryForeground : colors.ink}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.textPrimary : styles.textDefault,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
