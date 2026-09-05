import { FILTER_OPTIONS, type FilterValue } from "@shared/types/clothing";
import { Chip, ChipRow } from "@/components/molecules";

type CategoryFilterChipsProps = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

export function CategoryFilterChips({
  value,
  onChange,
}: CategoryFilterChipsProps) {
  return (
    <ChipRow>
      {FILTER_OPTIONS.map((option) => (
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
