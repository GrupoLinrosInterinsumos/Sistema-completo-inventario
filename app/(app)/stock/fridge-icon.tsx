// Ilustración simple "3D" de una refrigeradora (caras frontal + superior +
// lateral, como un cubo) para dar identidad visual a las ubicaciones de
// SACCO — puramente decorativa, no reemplaza los chips de "hermanos".
export function FridgeIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Refrigeradora"
      className="shrink-0"
    >
      <polygon points="14,10 46,10 56,2 24,2" fill="var(--color-primary-fixed)" />
      <polygon points="46,10 46,54 56,46 56,2" fill="var(--color-primary-container)" />
      <rect x="14" y="10" width="32" height="44" rx="2" fill="var(--color-primary-fixed-dim)" />
      <line x1="14" y1="26" x2="46" y2="26" stroke="var(--color-primary)" strokeWidth="1.5" />
      <rect x="18" y="14" width="2.5" height="8" rx="1.25" fill="var(--color-primary)" />
      <rect x="18" y="30" width="2.5" height="20" rx="1.25" fill="var(--color-primary)" />
      <circle cx="41" cy="18" r="2" fill="var(--color-secondary)" />
    </svg>
  );
}
