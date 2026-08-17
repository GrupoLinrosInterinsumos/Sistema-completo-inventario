type Tone = "primary" | "secondary" | "success" | "warning";

const FILL: Record<Tone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-green-600",
  warning: "bg-amber-500",
};

export function ProgressBar({
  value,
  max,
  tone = "primary",
}: {
  value: number;
  max: number;
  tone?: Tone;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
    >
      <div className={`h-full rounded-full ${FILL[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
