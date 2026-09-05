interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  barColor: string;
  showValue?: boolean;
  suffix?: string;
}

export default function ScoreBar({
  label,
  value,
  max = 100,
  barColor,
  showValue = true,
  suffix = '',
}: ScoreBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {showValue && (
          <span className="text-sm font-semibold text-slate-900">
            {value}
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
