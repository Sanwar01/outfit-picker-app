import { ChevronRight } from "lucide-react";

interface WardrobeSectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  actionLabel?: string;
}

export function WardrobeSectionHeader({
  title,
  onViewAll,
  actionLabel = "View all",
}: WardrobeSectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          {actionLabel}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
