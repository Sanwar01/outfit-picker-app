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
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {actionLabel}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
