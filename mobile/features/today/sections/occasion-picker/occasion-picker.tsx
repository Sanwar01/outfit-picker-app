import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import { styles } from "./occasion-picker.styles";

type Occasion = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const OCCASIONS: Occasion[] = [
  { id: "work", label: "Work", icon: "briefcase-outline" },
  { id: "date_night", label: "Date night", icon: "heart-outline" },
  { id: "gym", label: "Gym", icon: "barbell-outline" },
  { id: "travel", label: "Travel", icon: "airplane-outline" },
  { id: "formal", label: "Wedding", icon: "sparkles-outline" },
];

type OccasionPickerProps = {
  activeOccasion?: string | null;
  onSelect: (occasionId: string) => void;
};

export function OccasionPicker({
  activeOccasion,
  onSelect,
}: OccasionPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Dressing for something else?</Text>
      <View style={styles.row}>
        {OCCASIONS.map((o) => {
          const isActive = activeOccasion === o.id;
          return (
            <Pressable
              key={o.id}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onSelect(o.id)}
            >
              <Ionicons
                name={o.icon}
                size={20}
                color={colors.ink}
              />
              <Text style={styles.label} numberOfLines={2}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
