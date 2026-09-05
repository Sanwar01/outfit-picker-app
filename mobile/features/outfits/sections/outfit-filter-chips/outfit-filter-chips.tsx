import {
  OUTFIT_FILTER_OPTIONS,
  type OutfitListFilter,
} from "@shared/outfits/outfit-display";
import { Chip, ChipRow } from "@/components/molecules";

type OutfitFilterChipsProps = {
  value: OutfitListFilter;
  onChange: (value: OutfitListFilter) => void;
};

export function OutfitFilterChips({ value, onChange }: OutfitFilterChipsProps) {
  return (
    <ChipRow>
      {OUTFIT_FILTER_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ChipRow>
  );
}
