type DayActivity = { label: string; ingreso: number; salida: number };

export function ActivityChart({ data }: { data: DayActivity[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.ingreso, d.salida)));

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Salidas
        </span>
      </div>

      <div className="mt-4 flex h-40 items-end justify-between gap-2">
        {data.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              <div
                className="w-2.5 rounded-t-sm bg-primary sm:w-3"
                style={{ height: `${(day.ingreso / max) * 100}%` }}
                title={`Ingresos: ${day.ingreso} kg`}
              />
              <div
                className="w-2.5 rounded-t-sm bg-secondary sm:w-3"
                style={{ height: `${(day.salida / max) * 100}%` }}
                title={`Salidas: ${day.salida} kg`}
              />
            </div>
            <span className="text-xs text-on-surface-variant">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
