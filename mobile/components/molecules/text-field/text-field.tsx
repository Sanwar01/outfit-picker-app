import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";
import { styles } from "./text-field.styles";

type TextFieldType = "text" | "email" | "password";

type TextFieldProps = Omit<TextInputProps, "secureTextEntry"> & {
  label?: string;
  type?: TextFieldType;
};

const ICONS: Record<TextFieldType, keyof typeof Ionicons.glyphMap> = {
  text: "person-outline",
  email: "mail-outline",
  password: "lock-closed-outline",
};

export function TextField({
  label,
  type = "text",
  style,
  ...props
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const showIcon = !label;

  const input = (
    <TextInput
      {...props}
      secureTextEntry={isPassword && !showPassword}
      placeholderTextColor={colors.inkFaint}
      style={[
        showIcon ? styles.iconInput : styles.labeledInput,
        isPassword && showIcon && styles.inputWithToggle,
        style,
      ]}
    />
  );

  if (label) {
    return (
      <View style={styles.labeledWrap}>
        <Text style={styles.label}>{label}</Text>
        {input}
      </View>
    );
  }

  return (
    <View style={styles.iconWrap}>
      <Ionicons
        name={ICONS[type]}
        size={18}
        color={colors.inkFaint}
        style={styles.leftIcon}
      />
      {input}
      {isPassword ? (
        <Pressable
          onPress={() => setShowPassword((current) => !current)}
          style={styles.eye}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={colors.inkFaint}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
