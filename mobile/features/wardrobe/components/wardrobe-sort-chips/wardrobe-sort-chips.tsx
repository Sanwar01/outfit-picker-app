import {
  WARDROBE_SORT_OPTIONS,
  type WardrobeSortValue,
} from "@shared/wardrobe/wardrobe-display";
import { Chip, ChipRow } from "@/components/molecules";

type WardrobeSortChipsProps = {
  value: WardrobeSortValue;
  onChange: (value: WardrobeSortValue) => void;
};

export function WardrobeSortChips({ value, onChange }: WardrobeSortChipsProps) {
  return (
    <ChipRow>
      {WARDROBE_SORT_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          selectedTone="brand"
          onPress={() => onChange(option.value)}
        />
      ))}
    </ChipRow>
  );
}
