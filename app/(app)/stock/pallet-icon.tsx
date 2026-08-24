// Ilustración simple "3D" de una paleta con su caja (mismo estilo cubo que
// FridgeIcon) para CRAMER — muestra el N° de paleta sobre la caja y el N° de
// caja como etiqueta, para identificar la ubicación de un vistazo.
export function PalletIcon({ numero, caja, size = 40 }: { numero: string; caja: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Paleta ${numero}, caja ${caja}`}
      className="shrink-0"
    >
      {/* caja (mismo cubo que la refrigeradora, más chico y más arriba) */}
      <polygon points="14,6 42,6 50,0 22,0" fill="var(--color-primary-fixed)" />
      <polygon points="42,6 42,40 50,34 50,0" fill="var(--color-primary-container)" />
      <rect x="14" y="6" width="28" height="34" rx="2" fill="var(--color-primary-fixed-dim)" />
      <text
        x="28"
        y="26"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--color-primary)"
      >
        {numero}
      </text>

      {/* paleta de madera debajo */}
      <rect x="8" y="44" width="48" height="4" rx="1" fill="var(--color-outline-variant)" />
      <rect x="8" y="50" width="48" height="4" rx="1" fill="var(--color-outline-variant)" />
      <rect x="8" y="56" width="48" height="4" rx="1" fill="var(--color-outline-variant)" />

      {/* etiqueta con el N° de caja */}
      <rect x="28" y="40" width="24" height="12" rx="2" fill="var(--color-secondary)" />
      <text x="40" y="49" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--color-on-secondary)">
        {caja}
      </text>
    </svg>
  );
}
