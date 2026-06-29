interface TodayHeaderProps {
  greeting: string;
  subtitle: string | null;
}

export function TodayHeader({ greeting, subtitle }: TodayHeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
        {greeting}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
