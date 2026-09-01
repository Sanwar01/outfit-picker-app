import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius } from "@/lib/theme";

type WardrobeSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function WardrobeSearchBar({ value, onChangeText }: WardrobeSearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.inkFaint}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search name, brand, colour…"
        placeholderTextColor={colors.inkFaint}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={8}
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 8,
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
    paddingVertical: 10,
  },
});
