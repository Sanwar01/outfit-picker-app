import { View } from "react-native";
import { SearchBar } from "@/components/molecules";
import { styles } from "./wardrobe-search-bar.styles";

type WardrobeSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function WardrobeSearchBar({ value, onChangeText }: WardrobeSearchBarProps) {
  return (
    <View style={styles.wrap}>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        placeholder="Search name, brand, colour…"
      />
    </View>
  );
}
