import { Text, View } from "react-native";
import { STYLE_VIBES, type StyleVibe } from "@shared/types/clothing";
import { Chip } from "@/components/molecules";
import { styles } from "./style-chips.styles";

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
        {STYLE_VIBES.map((vibe) => (
          <Chip
            key={vibe}
            label={vibe}
            selected={selected.includes(vibe)}
            onPress={() => toggle(vibe)}
          />
        ))}
      </View>
      <Text style={styles.hint}>
        {selected.length}/{MAX_VIBES} selected
      </Text>
    </View>
  );
}
