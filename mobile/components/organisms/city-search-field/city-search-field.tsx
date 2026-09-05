import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchCities, type ResolvedLocation } from "@/services/location";
import { colors } from "@/theme";
import { styles } from "./city-search-field.styles";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

type CitySearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSelect: (location: ResolvedLocation) => void;
};

export function CitySearchField({
  value,
  onChangeText,
  onSelect,
}: CitySearchFieldProps) {
  const [suggestions, setSuggestions] = useState<ResolvedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  function scheduleSearch(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(() => {
      const requestId = ++requestRef.current;
      void searchCities(trimmed)
        .then((results) => {
          if (requestId !== requestRef.current) return;
          setSuggestions(results);
          setSearching(false);
        })
        .catch(() => {
          if (requestId !== requestRef.current) return;
          setSuggestions([]);
          setSearching(false);
        });
    }, DEBOUNCE_MS);
  }

  return (
    <View>
      <View style={styles.field}>
        <Ionicons
          name="location-outline"
          size={18}
          color={colors.inkFaint}
          style={styles.icon}
        />
        <TextInput
          value={value}
          onChangeText={(next) => {
            onChangeText(next);
            scheduleSearch(next);
          }}
          placeholder="Search for a city"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
        />
        {searching ? (
          <ActivityIndicator
            size="small"
            color={colors.brand}
            style={styles.trailing}
          />
        ) : null}
      </View>

      {suggestions.length > 0 ? (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <Pressable
              key={`${item.lat},${item.lng},${item.city}`}
              onPress={() => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                requestRef.current += 1;
                setSuggestions([]);
                setSearching(false);
                onSelect(item);
              }}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.inkMuted}
              />
              <Text style={styles.rowLabel} numberOfLines={2}>
                {item.city}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
