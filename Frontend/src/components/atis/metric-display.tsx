interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  testId?: string;
}

export function MetricDisplay({ label, value, unit, subtext, testId }: MetricDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-2xl md:text-3xl font-bold" data-testid={testId}>
          {value}
        </div>
        {unit && <div className="text-sm font-medium text-muted-foreground">{unit}</div>}
      </div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}
