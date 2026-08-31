import { Pressable, StyleSheet, Text, View } from "react-native";
import { STYLE_VIBES, type StyleVibe } from "@shared/types/clothing";
import { colors, fonts } from "@/lib/theme";

const MAX_VIBES = 3;

type StyleChipsProps = {
  selected: StyleVibe[];
  onChange: (vibes: StyleVibe[]) => void;
};

export function StyleChips({ selected, onChange }: StyleChipsProps) {
  function toggle(vibe: StyleVibe) {
    if (selected.includes(vibe)) {
      onChange(selected.filter((item) => item !== vibe));
      return;
    }
    if (selected.length >= MAX_VIBES) return;
    onChange([...selected, vibe]);
  }

  return (
    <View>
      <View style={styles.wrap}>
        {STYLE_VIBES.map((vibe) => {
          const isSelected = selected.includes(vibe);
          return (
            <Pressable
              key={vibe}
              onPress={() => toggle(vibe)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {vibe}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {selected.length}/{MAX_VIBES} selected
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  labelSelected: {
    color: colors.primaryForeground,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 10,
  },
});
