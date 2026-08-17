import type { NavIcon } from "@/lib/nav";

const PATHS: Record<NavIcon, React.ReactNode> = {
  dashboard: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  ingreso: (
    <>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      <path d="M12 3v8m0 0-3-3m3 3 3-3" />
    </>
  ),
  desglose: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  buscar: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.35-4.35" />
    </>
  ),
  stock: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 11h8M8 14.5h8M8 18h5" />
    </>
  ),
  kardex: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  productos: (
    <>
      <path d="M11 3H5a2 2 0 0 0-2 2v6l9.5 9.5a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8L11 3Z" />
      <circle cx="7.5" cy="7.5" r="1.25" />
    </>
  ),
  usuarios: (
    <>
      <circle cx="8" cy="9" r="3" />
      <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="16.5" cy="8.5" r="2.5" />
      <path d="M13.5 12.7a5 5 0 0 1 7 4.3" />
    </>
  ),
  ubicacion: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M3.5 9.5h17M3.5 15h17M9 3.5v17M14.5 3.5v17" />
    </>
  ),
};

export function NavIconGlyph({ icon, className }: { icon: NavIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[icon]}
    </svg>
  );
}
