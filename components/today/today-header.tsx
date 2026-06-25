interface TodayHeaderProps {
  greeting: string;
  subtitle: string | null;
}

export function TodayHeader({ greeting, subtitle }: TodayHeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
        {greeting}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      )}
    </div>
  );
}
