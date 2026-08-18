import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius } from "@/lib/theme";

type AuthFieldType = "text" | "email" | "password";

type AuthFieldProps = Omit<TextInputProps, "secureTextEntry"> & {
  type?: AuthFieldType;
};

const ICONS: Record<AuthFieldType, keyof typeof Ionicons.glyphMap> = {
  text: "person-outline",
  email: "mail-outline",
  password: "lock-closed-outline",
};

export function AuthField({ type = "text", style, ...props }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <View style={styles.wrap}>
      <Ionicons
        name={ICONS[type]}
        size={18}
        color={colors.inkFaint}
        style={styles.leftIcon}
      />
      <TextInput
        {...props}
        secureTextEntry={isPassword && !showPassword}
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, isPassword && styles.inputWithToggle, style]}
      />
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

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    justifyContent: "center",
  },
  leftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 52,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  eye: {
    position: "absolute",
    right: 16,
    zIndex: 1,
  },
});
