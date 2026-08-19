import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

type Occasion = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const OCCASIONS: Occasion[] = [
  { id: "work", label: "Work", icon: "briefcase-outline" },
  { id: "date", label: "Date night", icon: "heart-outline" },
  { id: "gym", label: "Gym", icon: "barbell-outline" },
  { id: "travel", label: "Travel", icon: "airplane-outline" },
  { id: "wedding", label: "Wedding", icon: "ribbon-outline" },
];

type OccasionPickerProps = {
  onSelect: (occasionId: string) => void;
};

export function OccasionPicker({ onSelect }: OccasionPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>DRESSING FOR SOMETHING ELSE?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {OCCASIONS.map((o) => (
          <Pressable
            key={o.id}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            onPress={() => onSelect(o.id)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={o.icon} size={20} color={colors.inkMuted} />
            </View>
            <Text style={styles.label}>{o.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
    letterSpacing: 1.2,
    color: colors.inkMuted,
  },
  row: {
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    alignItems: "center",
    gap: 6,
    minWidth: 64,
  },
  chipPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.tile,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
