import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

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

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  heading: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.inkFaint,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  chipActive: {
    borderColor: colors.brand,
  },
  chipPressed: {
    backgroundColor: colors.surfaceHover,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
